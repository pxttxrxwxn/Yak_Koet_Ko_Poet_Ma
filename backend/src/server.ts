// Cloudflare Workers entrypoint (referenced by wrangler.jsonc "main").
// Wires D1 + KV implementations into the runtime-agnostic app.
import { createApp } from './app'
import { createContainer } from './di/container'
import { D1QuizAttemptRepository } from './infrastructure/d1/d1-quiz-attempt-repository'
import { D1QuizRepository } from './infrastructure/d1/d1-quiz-repository'
import { D1UserRepository } from './infrastructure/d1/d1-user-repository'
import { KVCacheRepository } from './infrastructure/kv/kv-cache-repository'
import type { Bindings } from './types'

const app = createApp((env) => {
  const bindings = env as Bindings
  return createContainer({
    userRepository: new D1UserRepository(bindings.DB),
    cacheRepository: new KVCacheRepository(bindings.KV),
    quizRepository: new D1QuizRepository(bindings.DB),
    quizAttemptRepository: new D1QuizAttemptRepository(bindings.DB),
  })
})

export default app
