
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SnakeBorder } from "./HeroTextAnimation/SnakeBorder";

export default function ShapeComponent() {
  return (
    <SnakeBorder
      className="mx-auto aspect-[400/220] w-full max-w-md"
      speed={4}
      snakeLength={90}
    >
      <Card className="h-full border-0 shadow-none">
        <CardHeader>
          <CardTitle>Snake Border</CardTitle>
        </CardHeader>

        <CardContent>
          This is a custom animated snake border
          around a shadcn component.
        </CardContent>
      </Card>
    </SnakeBorder>
  );
}