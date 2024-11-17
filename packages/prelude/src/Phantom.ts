import { Data, Equal, ParseResult, Schema } from "effect"

export class Phantom<A, B, N = unknown> extends Data.Class<{ value: B }> {
  _A!: A

  _N!: N

  private constructor(public readonly value: B) {
    super({ value })
  }

  equals(that: Phantom<A, B, N>): boolean {
    return Equal.equals(this, that)
  }

  static make =
    <N extends Phantom<any, any, any>>() =>
    (value: N["value"]): N =>
      new Phantom<N["_A"], N["value"], N["_N"]>(value) as N

  static schema = <P extends Phantom<any, any, any>, I = P["value"], R = never>(
    item: Schema.Schema<P["value"], I, R>
  ): Schema.Schema<P, I, R> =>
    Schema.transform(item, this.schemaFromSelf(item), {
      strict: true,
      decode: (item) => Phantom.make<P>()(item),
      encode: (phantom) => phantom.value
    })

  static schemaFromSelf = <P extends Phantom<any, any, any>, I, R = never>(
    item: Schema.Schema<P["value"], I, R>
  ): Schema.Schema<P, P, R> =>
    Schema.declare(
      [item],
      {
        decode: (item) => (input, parseOptions, ast) => {
          if (input instanceof Phantom) {
            return ParseResult.decodeUnknown(item, parseOptions)(input.value).pipe(ParseResult.map(Phantom.make<P>()))
          }

          return ParseResult.fail(new ParseResult.Type(ast, input))
        },
        encode: (item) => (input, parseOptions, ast) => {
          if (input instanceof Phantom) {
            const elements = ParseResult.encodeUnknown(item)(input.value, parseOptions)
            return ParseResult.map(elements, (is): P => Phantom.make<P>()(is))
          }
          return ParseResult.fail(new ParseResult.Type(ast, input))
        }
      },
      {
        description: `Phantom<${Schema.format(item)}>`
      }
    ).annotations({
      arbitrary: () => (fc) => fc.string({ minLength: 1 }).map(Phantom.make<P>())
    })
}
