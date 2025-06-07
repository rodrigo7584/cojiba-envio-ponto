"use client"; // Se estiver usando Next.js App Router

import { ArrowBigLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export default function VoltarBotao() {
  const router = useRouter();

  return (
    <Button onClick={() => router.back()}>
      <ArrowBigLeft/>
      Voltar
    </Button>
  );
}
