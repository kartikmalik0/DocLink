"use client"
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '../_trpc/client'

const Page = () => {
  const router = useRouter()
  
  const searchParmas = useSearchParams()
  const origin = searchParmas.get('origin')

 
    const {data} = trpc.authcallback.useQuery( undefined, {
      onSuccess:({success})=>{
          if(success){
            router.push(origin ? `/${origin}` : "/dashboard")
          }
        }
    })

    
}

export default Page
