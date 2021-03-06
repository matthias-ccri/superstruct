import { Struct, Context, Validator } from '../struct'
import { object, optional } from './types'
import { ObjectSchema, Assign, ObjectType, PartialObjectSchema } from '../utils'

/**
 * Create a new struct that combines the properties properties from multiple
 * object structs.
 *
 * Like JavaScript's `Object.assign` utility.
 */

export function assign<A extends ObjectSchema, B extends ObjectSchema>(
  A: Struct<ObjectType<A>, A>,
  B: Struct<ObjectType<B>, B>
): Struct<ObjectType<Assign<A, B>>, Assign<A, B>>
export function assign<
  A extends ObjectSchema,
  B extends ObjectSchema,
  C extends ObjectSchema
>(
  A: Struct<ObjectType<A>, A>,
  B: Struct<ObjectType<B>, B>,
  C: Struct<ObjectType<C>, C>
): Struct<ObjectType<Assign<Assign<A, B>, C>>, Assign<Assign<A, B>, C>>
export function assign<
  A extends ObjectSchema,
  B extends ObjectSchema,
  C extends ObjectSchema,
  D extends ObjectSchema
>(
  A: Struct<ObjectType<A>, A>,
  B: Struct<ObjectType<B>, B>,
  C: Struct<ObjectType<C>, C>,
  D: Struct<ObjectType<D>, D>
): Struct<
  ObjectType<Assign<Assign<Assign<A, B>, C>, D>>,
  Assign<Assign<Assign<A, B>, C>, D>
>
export function assign<
  A extends ObjectSchema,
  B extends ObjectSchema,
  C extends ObjectSchema,
  D extends ObjectSchema,
  E extends ObjectSchema
>(
  A: Struct<ObjectType<A>, A>,
  B: Struct<ObjectType<B>, B>,
  C: Struct<ObjectType<C>, C>,
  D: Struct<ObjectType<D>, D>,
  E: Struct<ObjectType<E>, E>
): Struct<
  ObjectType<Assign<Assign<Assign<Assign<A, B>, C>, D>, E>>,
  Assign<Assign<Assign<Assign<A, B>, C>, D>, E>
>
export function assign(...Structs: Struct<any>[]): any {
  const schemas = Structs.map((s) => s.schema)
  const schema = Object.assign({}, ...schemas)
  return object(schema)
}

/**
 * Define a new struct with a custom validation function.
 */

export function define<T>(
  name: string,
  validator: Validator<T, null>
): Struct<T, null> {
  return new Struct({ type: name, schema: null, validator })
}

/**
 * Create a struct with dynamic, runtime validation.
 *
 * The callback will receive the value currently being validated, and must
 * return a struct object to validate it with. This can be useful to model
 * validation logic that changes based on its input.
 */

export function dynamic<T>(
  fn: (value: unknown, ctx: Context<T, null>) => Struct<T, any>
): Struct<T, null> {
  return define('dynamic', (value, ctx) => {
    return ctx.check(value, fn(value, ctx))
  })
}

/**
 * Create a struct with lazily evaluated validation.
 *
 * The first time validation is run with the struct, the callback will be called
 * and must return a struct object to use. This is useful for cases where you
 * want to have self-referential structs for nested data structures to avoid a
 * circular definition problem.
 */

export function lazy<T>(fn: () => Struct<T, any>): Struct<T, null> {
  let s: Struct<T, any> | undefined

  return define('lazy', (value, ctx) => {
    if (!s) {
      s = fn()
    }

    return ctx.check(value, s)
  })
}

/**
 * Create a new struct based on an existing object struct, but excluding
 * specific properties.
 *
 * Like TypeScript's `Omit` utility.
 */

export function omit<S extends ObjectSchema, K extends keyof S>(
  struct: Struct<ObjectType<S>, S>,
  keys: K[]
): Struct<ObjectType<Omit<S, K>>, Omit<S, K>> {
  const { schema } = struct
  const subschema: any = { ...schema }

  for (const key of keys) {
    delete subschema[key]
  }

  return object(subschema as Omit<S, K>)
}

/**
 * Create a new struct based on an existing object struct, but with all of its
 * properties allowed to be `undefined`.
 *
 * Like TypeScript's `Partial` utility.
 */

export function partial<S extends ObjectSchema>(
  struct: Struct<ObjectType<S>, S> | S
): Struct<ObjectType<PartialObjectSchema<S>>, PartialObjectSchema<S>> {
  const schema: any =
    struct instanceof Struct ? { ...struct.schema } : { ...struct }

  for (const key in schema) {
    schema[key] = optional(schema[key])
  }

  return object(schema) as any
}

/**
 * Create a new struct based on an existing object struct, but only including
 * specific properties.
 *
 * Like TypeScript's `Pick` utility.
 */

export function pick<S extends ObjectSchema, K extends keyof S>(
  struct: Struct<ObjectType<S>, S>,
  keys: K[]
): Struct<ObjectType<Pick<S, K>>, Pick<S, K>> {
  const { schema } = struct
  const subschema: any = {}

  for (const key of keys) {
    subschema[key] = schema[key]
  }

  return object(subschema as Pick<S, K>)
}
