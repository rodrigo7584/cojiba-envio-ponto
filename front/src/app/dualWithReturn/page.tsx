"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpFromLine, MailIcon, Undo2Icon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState } from "react";

export default function DualWithReturn() {
  const [pdfColaboradores, setPdfColaboradores] = useState(null);
  const [pdfTarget, setPdfTarget] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState([]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!pdfColaboradores || !pdfTarget) {
      setStatus("❌ Selecione os dois arquivos PDF.");
      return;
    }

    const formData = new FormData();
    formData.append("pdfColaboradores", pdfColaboradores);
    formData.append("pdfTarget", pdfTarget);

    setLoading(true);
    setStatus("⏳ Processando...");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/uploadDual/processarDual`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setResultados(data.resultados);
        setStatus(`✅ Processado.`);
      } else {
        setStatus(`❌ ${data.mensagem || "Erro no processamento"}`);
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Erro na conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarEmails = async () => {
    setLoading(true);
    setStatus("⏳ Enviando e-mails...");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/uploadDual/enviarEmailsDual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lista: resultados }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("✅ E-mails enviados com sucesso!");
        setResultados([]);
      } else {
        setStatus(`❌ ${data.error || "Erro ao enviar e-mails"}`);
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Erro ao enviar os e-mails.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async () => {
    setLoading(true);
    setStatus("⏳ Cancelando operação...");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/uploadDual/cancelarOperacao`, {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("✅ Operação cancelada.");
        setResultados([]);
      } else {
        setStatus(`❌ ${data.error || "Erro ao cancelar"}`);
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Erro ao cancelar a operação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6 gap-6">
      <h1 className="text-2xl font-bold text-gray-700">Envio de ponto</h1>
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-1">
          <h2 className="text-md font-medium">Arquivo Sênior</h2>
          <Input type="file" accept="application/pdf" onChange={(e) => setPdfColaboradores(e.target.files[0])} />
          <h2 className="text-md font-medium mt-2">Arquivo Ponto</h2>
          <Input type="file" accept="application/pdf" onChange={(e) => setPdfTarget(e.target.files[0])} />
          <Button type="submit" disabled={loading} className="w-full mt-4">
            <ArrowUpFromLine/>
            {loading ? "Processando..." : "Processar PDFs"}
          </Button>
        </form>
        {status && <p className="mt-4 text-sm">{status}</p>}
      </div>
      
      {resultados.length > 0 && (
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-2xl">
        <div className="mt-4">
          <h2 className="font-bold mb-2 text-center">E-mails encontrados:</h2>
          <Table className="p-6 bg-blue-50 rounded-lg shadow-lg">
            <TableCaption>Lista de emails</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium text-center">Página</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resultados.map((r, idx) => (
                <TableRow  key={idx}>
                  <TableCell className="font-medium text-center text-sm">{r.pagina}</TableCell>
                  <TableCell className="text-xs">{r.nome}</TableCell>
                  <TableCell className="text-xs">{r.email ? r.email : 'Não possui email'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleEnviarEmails} disabled={loading} className="bg-green-500 hover:bg-green-400 flex-1/2">
              <MailIcon/>
              Enviar E-mails
            </Button>
            <Button onClick={handleCancelar} disabled={loading} className="bg-red-500 hover:bg-red-400 flex-1/2">
              <Undo2Icon/>
              Cancelar
            </Button>
          </div>
        </div>
      </div>
      )}
    
    </div>
  );
}
