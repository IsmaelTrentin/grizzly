import { Driver, Integer, Session, SessionConfig } from 'neo4j-driver';
import { type Labels } from './schema';

type NumberOrInteger = number | bigint | Integer;

export type NodeObject<
  I extends NumberOrInteger,
  P extends Record<string, any>,
  L extends Labels
> = {
  identity: I;
  labels: L;
  properties: P;
  elementId: string;
};

class GrizzlyHandler {
  private session;

  constructor(session: Session) {
    this.session = session;
  }

  async closeSession() {
    await this.session.close();
  }

  // create<V extends string = never>() {
  //   return new CreateQueryBuilder<V>(this.session);
  // }

  // match<V extends string = never>() {
  //   return new MatchQueryBuilder<V>(this.session) as Omit<
  //     MatchQueryBuilder<V>,
  //     'where'
  //   >;
  // }

  // async runQuery(query: string) {
  //   return await this.session.run(query);
  // }
}

/*
type VarEntry = {
  def: NodeDef;
  values: InferModel<NodeDef, 'create'>;
};

class QueryBuilder<QueryVariables extends string> {
  protected query = '';
  private session: Session;
  private params: Record<string, unknown> = {};
  protected variables: Record<QueryVariables, VarEntry> = {} as Record<
    QueryVariables,
    VarEntry
  >;

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

    type MappedRecord<T extends typeof this.variables> = {
      [K in keyof T]: T[K] extends VarEntry
        ? NodeObject<Integer, InferModel<T[K]['def']>, T[K]['def']['labels']>
        : never;
    };

    type MappedResultObject<T extends typeof this.variables> = {
      [K in keyof T]: T[K] extends VarEntry
        ? NodeObject<Integer, InferModel<T[K]['def']>, T[K]['def']['labels']>[]
        : never;
    };

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

class CreateQueryBuilder<V extends string> extends QueryBuilder<V> {
  constructor(session: Session) {
    super(session);
    this.query = 'CREATE ';
  }
}

// type MatchEntryValues<T extends NodeDef> = {
//   [K in keyof InferModel<T>]?:
//     | InferModel<T>[K]
//     | {
//         operator: string;
//         value: any;
//       };
// };

// type MatchVarEntry = {
//   def: NodeDef;
//   values: MatchEntryValues<NodeDef>;
// };

class MatchQueryBuilder<V extends string> extends QueryBuilder<V> {
  // protected variables: Record<V, MatchVarEntry> = {} as Record<
  //   V,
  //   MatchVarEntry
  // >;

  constructor(session: Session) {
    super(session);
    this.query = 'MATCH ';
  }

  // node<D extends NodeDef>(
  //   variable: V,
  //   def: D,
  //   values?: Partial<InferModel<D, 'create'>>
  // ) {
  //   if (values != undefined) {
  //     this.variables[variable] = {
  //       def,
  //       values,
  //     };
  //   }

  //   return this;
  // }

  where() {
    return this;
  }
}
*/

export * from './schema';
export default function grizzly(driver: Driver, sessionCfg?: SessionConfig) {
  const session = driver.session(sessionCfg);

  return new GrizzlyHandler(session);
}
