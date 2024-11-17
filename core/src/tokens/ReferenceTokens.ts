import { Array, DateTime, Duration, Effect, Equal, HashMap, Option, Ref } from "effect"
import { Token, Tokens } from "./Tokens"
import { Id } from "@wozza/prelude"

export class ReferenceTokens<A> implements Tokens<A> {
  static make = <A>(): Effect.Effect<Tokens<A>> =>
    Effect.gen(function* () {
      const state = yield* Ref.make(new State<A>(HashMap.empty()))

      return new ReferenceTokens<A>(state)
    })

  private constructor(private readonly state: Ref.Ref<State<A>>) {}

  issue = (value: A, timeToLive: Duration.Duration): Effect.Effect<Token<A>> => {
    return Effect.gen(this, function* () {
      const id = yield* Id.makeRandom<A>()
      const token = Token.make<A>(id.value)
      const expiresAt = yield* DateTime.now.pipe(Effect.map(DateTime.addDuration(timeToLive)))

      yield* Ref.update(this.state, (s) => s.issue(token, value, expiresAt))

      return token
    })
  }

  lookup = (token: Token<A>): Effect.Effect<A, Token.NoSuchToken> => {
    return DateTime.now.pipe(
      Effect.flatMap((time) => Ref.get(this.state).pipe(Effect.flatMap((s) => s.lookup(token, time)))),
      Effect.mapError(() => new Token.NoSuchToken())
    )
  }

  findByValue = (value: A): Effect.Effect<Array<Token<A>>> => {
    return Ref.get(this.state).pipe(Effect.map((s) => s.findByValue(value)))
  }

  revoke = (token: Token<A>): Effect.Effect<void> => {
    return Ref.update(this.state, (s) => s.revokeMany([token]))
  }

  revokeMany = (tokens: Array<Token<A>>): Effect.Effect<void> => {
    return Ref.update(this.state, (s) => s.revokeMany(tokens))
  }

  revokeAll = (value: A): Effect.Effect<void> => {
    return this.findByValue(value).pipe(Effect.flatMap(this.revokeMany))
  }
}

class State<A> {
  constructor(private readonly tokens: HashMap.HashMap<Token<A>, [A, DateTime.DateTime]>) {}

  issue = (token: Token<A>, value: A, expiresAt: DateTime.DateTime): State<A> => {
    return new State(HashMap.set(this.tokens, token, [value, expiresAt]))
  }

  lookup = (token: Token<A>, time: DateTime.DateTime): Option.Option<A> => {
    return HashMap.get(this.tokens, token).pipe(
      Option.filter(([_, expiresAt]) => DateTime.greaterThanOrEqualTo(expiresAt, time)),
      Option.map(([value]) => value)
    )
  }

  revokeMany = (token: Array<Token<A>>): State<A> => {
    return new State(HashMap.removeMany(this.tokens, token))
  }

  findByValue = (a: A): Array<Token<A>> => {
    return HashMap.filter(this.tokens, ([value]) => Equal.equals(value, a)).pipe(HashMap.keys, Array.fromIterable)
  }
}
