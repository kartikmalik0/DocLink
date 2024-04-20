import { AppRouter } from '@/trpc'
import { createTRPCClient, createTRPCReact, httpBatchLink} from '@trpc/react-query'

export const trpc = createTRPCReact<AppRouter>({})