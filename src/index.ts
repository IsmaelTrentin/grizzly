import { CreateQueryBuilder } from './query/CreateQueryBuilder';
import type { Driver, Integer, Session, SessionConfig } from 'neo4j-driver';
import type { Labels } from './schema';

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

  create<V extends string = never>() {
    return new CreateQueryBuilder<V>(this.session);
  }

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

function grizzly(driver: Driver, sessionCfg?: SessionConfig) {
  const session = driver.session(sessionCfg);

  return new GrizzlyHandler(session);
}

/* --- EXPORTS --- */
export * from './schema';

export default grizzly;
