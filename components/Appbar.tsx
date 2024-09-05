'use client';

import { signIn, signOut, useSession } from "next-auth/react"
import Link from "next/link";
import { Button } from "./ui/button";

export const Appbar = ()=>{

    const session  = useSession();
    return (
      <div className="flex justify-between p-4 border-b">
        <div>
          <Link href="/" className="font-bold text-3xl">Musly</Link>
        </div>
        <div >
          {session.data?.user ? (
            <Button
            variant="secondary"
              onClick={() => signOut()}
            >
              Sign out
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => signIn()}
            >
              Sign in
            </Button>
          )}
        </div>
      </div>
    );
}
