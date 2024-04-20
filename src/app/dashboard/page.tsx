import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react'

const Page = async () => {
    const {getUser} = getKindeServerSession()
    const user = await getUser()
    if(!user || !user?.id) redirect('/auth-callback?orgin=dashboard')
    console.log(user)
  return (
    <div>
      {user?.email}
    </div>
  )
}

export default Page;
