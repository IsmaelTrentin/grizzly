import z from 'zod';
import {
  Date,
  DateTime,
  Duration,
  Integer,
  LocalDateTime,
  LocalTime,
  Point,
  Time,
} from 'neo4j-driver';

type CypherValidTypes =
  | Boolean
  | Date
  | DateTime
  | Duration
  | Number
  | Integer
  | LocalDateTime
  | LocalTime
  | Point
  | String
  | Time;

const booleanSchema = z.boolean();
export function boolean() {
  return booleanSchema;
}

const dateSchema = z.custom<Date>(val => {
  return val instanceof Date;
});
export function date() {
  return dateSchema;
}

const dateTimeSchema = z.custom<DateTime>(val => {
  return val instanceof DateTime;
});
export function dateTime() {
  return dateTimeSchema;
}

const durationSchema = z.custom<Duration>(val => {
  return val instanceof Duration;
});
export function duration() {
  return durationSchema;
}

const floatSchema = z.number();
export function float() {
  return floatSchema;
}

const integerSchema = z.custom<Integer>(val => {
  return val instanceof Integer;
});
export function integer() {
  return integerSchema;
}

const localDateTimeSchema = z.custom<LocalDateTime>(val => {
  return val instanceof LocalDateTime;
});
export function localDateTime() {
  return localDateTimeSchema;
}

const localTimeSchema = z.custom<LocalTime>(val => {
  return val instanceof LocalTime;
});
export function localTime() {
  return localTimeSchema;
}

const pointSchema = z.custom<Point>(val => {
  return val instanceof Point;
});
export function point() {
  return pointSchema;
}

const stringSchema = z.string();
export function string() {
  return stringSchema;
}

const timeSchema = z.custom<Time>(val => {
  return val instanceof Time;
});
export function time() {
  return timeSchema;
}

export type Labels = readonly [string, ...string[]];
// `| undefined` to support ZodOptional
type CypherValidZodSchema = z.ZodType<CypherValidTypes | undefined>;
type RelationshipDef = {
  type: NodeDef;
  relationship: {
    type: string;
    schema: z.ZodObject<z.ZodRawShape>;
  };
};
type DefaultSchema = {
  [x: string]: CypherValidZodSchema | RelationshipDef;
};

type InferFromSchema<T extends DefaultSchema> = {
  [K in keyof T as T[K] extends z.ZodOptional<any>
    ? never
    : K]: T[K] extends CypherValidZodSchema
    ? z.infer<T[K]>
    : T[K] extends RelationshipDef
    ? InferFromSchema<T[K]['type']['schema']>[]
    : 'ERROR';
} & {
  [K in keyof T as T[K] extends z.ZodOptional<any>
    ? K
    : never]?: T[K] extends CypherValidZodSchema
    ? z.infer<T[K]>
    : T[K] extends RelationshipDef
    ? InferFromSchema<T[K]['type']['schema']>[]
    : 'ERROR';
};

type ExcludeRelationships<T extends DefaultSchema> = {
  [K in keyof T as T[K] extends RelationshipDef ? never : K]: T[K];
};

export type InferModel<
  T extends NodeDef,
  Mode extends 'match' | 'create' = 'match'
> = Mode extends 'match'
  ? InferFromSchema<T['schema']>
  : InferFromSchema<ExcludeRelationships<T['schema']>>;

export class NodeDef<
  L extends Labels = Labels,
  S extends DefaultSchema = DefaultSchema
> {
  readonly labels: L;
  readonly schema: S;

  constructor(labels: L, schema: S) {
    this.labels = labels;
    this.schema = schema;
  }
}

export function node<
  L extends Labels = Labels,
  S extends DefaultSchema = DefaultSchema
>(labels: L, schema: S) {
  return new NodeDef(labels, schema);
}
