import { Button } from "@/components/button";
import Image from "next/image";

export default async function Home() {
  const res = await fetch('https://api.freeapi.app/api/v1/public/randomusers?page=1&limit=10');
  const data = await res.json();
  console.log(data);

  return (
    <>
      <h1>Hello in nextjs</h1>
      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam ex voluptas illo, consequuntur error molestias facere tempora? Commodi accusantium assumenda omnis ullam perferendis molestiae sapiente, enim quis, odio debitis tenetur alias repudiandae quidem fugit sed optio. Beatae, cum.</p>
      <Button />
    </>
  );
}
