import prismaClient from "@/src/lib/prismaClient";
import { hash } from "argon2";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z
  .object({
    name: z.string().min(2, { message: "이름은 2글자 이상이어야 합니다." }),
    email: z.string().email({ message: "올바른 이메일 주소를 입력해주세요." }),
    password: z
      .string()
      .min(6, { message: "비밀번호는 6자 이상이어야 합니다." }),
    confirmPassword: z.string(),
  })

export type RegisterResponse = {
  ok: boolean;
  message?: string;
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    const args = await req.json();
  
    const validatedFileds = registerSchema.safeParse(args)

    // 유효성 검사 결과를 확인합니다.
    // 유효성 검사를 통과하지 못한 경우 에러 응답을 반환합니다.
    if (!validatedFileds.success) {
      return NextResponse.json<RegisterResponse>(
        { ok: false, error: '유효하지 않은 필드입니다.' }, 
        { status: 400 }
      )
    }

    // validatedFileds.data는 유효성 검사를 통과한 데이터입니다.
    // validatedFileds.data를 사용하여 회원가입 로직을 구현합니다.
    const { name, email, password } = validatedFileds.data;
    
    console.log('data in register route: ', validatedFileds.data);

    // 이메일 중복 체크 로직 추가
    const user = await prismaClient.user.findUnique({
      where:{
        email: email
      }
    })

    // 유저가 이미 존재하는 경우 에러 처리
    if (user) {
      return NextResponse.json<RegisterResponse>(
        { ok: false, error: '이미 존재하는 이메일입니다.' }, 
        { status: 400 }
      )
    }

    // 비밀번호 해싱 로직 추가
    const hashedPassword = await hash(validatedFileds.data.password)


    // 유저 생성 로직 추가
    const newUser = await prismaClient.user.create({
      data: {
        name: name,
        email: email,
        password: password,
      },
    })

    console.log('new user: ', newUser)

    // 유저 생성 후 응답 반환
    // 유저 생성 실패 시 에러 처리
    if (!newUser) {
      return NextResponse.json<RegisterResponse>(
        { ok: false, message: '회원가입 실패' }, 
        { status: 500 }
      )
    }

    // 유저 생성 성공 시 응답
    return NextResponse.json<RegisterResponse>({ ok: true, message: '회원가입 완료'}, { status: 200 })

  } catch (error) {
    console.error('Error in register route: ', error)
    return NextResponse.json<RegisterResponse>(
      { ok: false, 
        error: 'Internal server error' }, 
        { status: 500 }
      )
  }
}