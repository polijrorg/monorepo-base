/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { toErrorMessage } from "./toErrorMessage";

export function returnInvalidDataErrors(error: ZodError) {
  const errors = error.issues.map(err => ({
    campo: err.path.join('.'),
    message: err.message
  }))
  
  return NextResponse.json(
    toErrorMessage(errors[0].message, errors),
    { status: 400 }
  )
}

export function zodErrorHandler(error: any) {
  if (error instanceof ZodError) {
    const errors = error.issues.map(err => ({
      campo: err.path.join('.'),
      message: err.message
    }))

    return NextResponse.json(
      toErrorMessage(errors[0].message, errors),
      { status: 400 }
    );
  }
    
  return NextResponse.json(
    toErrorMessage('Erro Interno do Servidor'),
    { status: 500 }
  );
}