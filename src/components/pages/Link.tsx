import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import BuyMeACoffeeButton from "../atoms/button/Coffee";
import { Mail } from "lucide-react";

const LinkData = [
  {
    link: "https://anothereden.wiki",
    label: "wiki",
    desc: "Another Eden Wiki",
  },
  {
    link: "https://altema.jp",
    label: "altema",
    desc: "altema.jp",
  },
  {
    link: "https://anothereden.game-info.wiki",
    label: "seesaa",
    desc: "Seesaa Wiki (JP)",
  },
  {
    link: "https://github.com/BeaverHouse/aecheck-front",
    label: "github",
    desc: "GitHub",
  },
];

function LinkPage() {
  return (
    <div className="p-12 flex flex-col items-center justify-center text-center">
      {LinkData.map((data) => (
        <Button
          key={data.label}
          variant="outline"
          className="w-full max-w-[400px] mb-6 flex items-center justify-start gap-2 h-auto py-3"
          asChild
        >
          <a
            href={data.link}
            target="_blank"
            rel="noreferrer"
            aria-label={data.label}
          >
            <Avatar className="w-[50px] h-[50px]">
              <AvatarImage src={`${process.env.NEXT_PUBLIC_CDN_URL}/icon/${data.label}.jpg`} alt={data.label} />
            </Avatar>
            <span className="flex-grow text-base">{data.desc}</span>
          </a>
        </Button>
      ))}
      <BuyMeACoffeeButton />
      <Button
        variant="secondary"
        className="w-[200px] pl-12 flex items-center gap-2"
        asChild
      >
        <a href="mailto:haulrest@gmail.com">
          <Mail className="h-4 w-4" />
          <span className="flex-grow font-bold">Report (e-mail)</span>
        </a>
      </Button>
    </div>
  );
}

export default LinkPage;
