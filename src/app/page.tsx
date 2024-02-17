import { SignIn, UserButton, auth, useUser } from "@clerk/nextjs";
import { unstable_noStore as noStore } from "next/cache";

import { CreatePost } from "~/app/_components/create-post";
import { api } from "~/trpc/server";
import { RouterOutputs } from "~/trpc/shared";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import Image from "next/image";
import { PlaceholderValue } from "next/dist/shared/lib/get-img-props";

dayjs.extend(relativeTime)

const CreatePostWizard = () => {
  const user = auth();

  console.log("user: ", user)

  return (
    <div className="flex gap-3 w-full">
      <UserButton />
      <input type="text" placeholder="Type some emojis" className="grow bg-transparent outline-none" />
    </div>
  )
}

type PostWithUser = RouterOutputs["posts"]["getAll"][number]

const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  return (
    <div key={post.id} className="p-4 border-b border-slate-400 flex gap-3">
      <Image
        src={author.profilePicture}
        className="rounded-full"
        alt={`@${author.username}'s profile picture` as PlaceholderValue}
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex text-slate-300">
          <span className="pr-2">
            {`@${author.username}`}
          </span>
          <span className="font-thin">{` · ${dayjs(post.createdAt).fromNow()}`}</span>
        </div>
        <span className="">
          {post.content}
        </span>
      </div>
    </div>
  )
}

export default async function Home() {
  noStore();
  const data = await api.posts.getAll.query();

  if (!data) return <div>Loading.....</div>

  return (
    <main className="flex justify-center h-screen">
      <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
        <div className="border-b border-slate-400 p-4">
          <div className="flex justify-center">
            <CreatePostWizard />
          </div>
          <SignIn />
        </div>

        <div className="flex flex-col">
          {[...data]?.map((fullPost) => (
            <PostView {...fullPost} key={fullPost.post.id} />
          ))}
        </div>

      </div>
    </main>
  );
}
