import type { InferModel, Labels, NodeDef } from '../schema';
import type { NodeObject } from '..';
import type { Integer, Session } from 'neo4j-driver';

type VarEntry = {
  def: NodeDef;
  values: InferModel<NodeDef, 'create'>;
};

type QueryBuilderVariables<QueryVariables extends string> = Record<
  QueryVariables,
  VarEntry
>;

type MappedRecord<T extends QueryBuilderVariables<string>> = {
  [K in keyof T]: T[K] extends VarEntry
    ? NodeObject<Integer, InferModel<T[K]['def']>, T[K]['def']['labels']>
    : never;
};

type MappedResultObject<T extends QueryBuilderVariables<string>> = {
  [K in keyof T]: T[K] extends VarEntry
    ? NodeObject<Integer, InferModel<T[K]['def']>, T[K]['def']['labels']>[]
    : never;
};

export class QueryBuilder<QueryVariables extends string> {
  protected query = '';
  private session: Session;
  private params: Record<string, unknown> = {};
  protected variables: QueryBuilderVariables<QueryVariables> =
    {} as QueryBuilderVariables<QueryVariables>;

  constructor(session: Session) {
    this.session = session;
  }

  private buildNode(
    labels: string[] | Labels,
    properties: Record<string, any> = {},
    varName: string = 'n'
  ) {
    type MappedParameters<P extends Record<string, any>, V extends string> = {
      [K in keyof P as `${V}${K & string}`]: P[K];
    };
    const propsKeys = Object.keys(properties);
    const parameterKeys = propsKeys.map(k => `${varName}${k}`);
    const parametersObj: MappedParameters<typeof properties, typeof varName> =
      {};
    parameterKeys.forEach(
      (pk, i) => (parametersObj[pk] = properties[propsKeys[i]])
    );
    const keys = propsKeys.map(k => `${k}: \$${varName}${k}`);
    const props = keys.length === 0 ? '' : ` {${keys.join(',')}}`;
    const nodeStr = `(${varName.trim()}:${labels.join(':')}${props})`;
    return [nodeStr, parametersObj] as const;
  }

  node<D extends NodeDef>(
    variable: QueryVariables,
    def: D,
    values: InferModel<D, 'create'>
  ) {
    this.variables[variable] = {
      def,
      values,
    };

    return this;
  }

  async returning() {
    if (this.query.trim() === '') {
      this.query = 'MATCH ';
    }

    const entries = Object.entries(this.variables) as [
      QueryVariables,
      VarEntry
    ][];
    const queryVariables = entries.map(([k]) => k);

    entries.forEach(([k, v], i) => {
      const [nodeStr, nodeParams] = this.buildNode(v.def.labels, v.values, k);
      this.query += nodeStr;
      i < queryVariables.length - 1 && (this.query += ',');
      this.params = { ...this.params, ...nodeParams };
    });

    this.query += `\nRETURN ${queryVariables.join(',')}`;

    console.info('running  :', this.query);
    console.info('params   :', this.params);
    console.info('variables:', this.variables);

    const res = await this.session.run<MappedRecord<typeof this.variables>>(
      this.query,
      this.params
    );

    // WORKAROUND to set dynamic properties
    // @ts-ignore
    const resultObject: MappedResultObject<typeof this.variables> = {};
    queryVariables.forEach(v => (resultObject[v] = []));

    const rKeys = res.records[0].keys ?? [];
    rKeys.forEach(rk =>
      resultObject[rk].push(...res.records.map(r => r.get(rk)))
    );

    return resultObject;
  }
}
