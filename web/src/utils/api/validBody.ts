import { NextResponse } from "next/server";

   
export async function validBody(request: any) {
  try {
    const body = await request.json();
    return body;
   
  } catch (e) {
    return NextResponse.json(
      { error: 'Formato de dados inválido - JSON malformado' },
      { status: 400 }
    )
  }
}