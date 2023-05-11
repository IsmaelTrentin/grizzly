import { QueryBuilder } from './QueryBuilder';
import type { Session } from 'neo4j-driver';

export class CreateQueryBuilder<V extends string> extends QueryBuilder<V> {
  constructor(session: Session) {
    super(session);
    this.query = 'CREATE ';
  }
}
