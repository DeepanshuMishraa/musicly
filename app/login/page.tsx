'use client';

import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"

const page = () => {
  return (
    <div>
        <h1>Login here</h1>
        <Button onClick={()=>signIn()}>Sign in with google</Button>
    </div>
  )
}

export default page
