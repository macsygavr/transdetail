// import { useEffect } from "react";
// import router, { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import Error404 from "@/assets/errors/error_404.png";
import Error500 from "@/assets/errors/error_500.png";

export default function NotFound() {
  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     router.push("/");
  //   }, 9000);
  //   return () => clearTimeout(timeout);
  // }, [router]);

  return (
    <div className=" flex flex-col">
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center ">
        <p className="text-lg font-semibold text-gray-800 mb-4">
          К сожалению, мы не смогли найти запрашиваемую страницу.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
          <Link
            href="/"
            className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
          >
            Главная страница
          </Link>

          <div className="flex gap-2">
            <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Выбрать трансмиссию</option>
              <option value="AL4">AL4</option>
              <option value="JF015E">JF015E</option>
              {/* Добавь другие опции при необходимости */}
            </select>
            <button className="bg-indigo-100 text-indigo-700 font-semibold px-4 py-2 rounded-lg hover:bg-indigo-200 transition">
              Подобрать
            </button>
          </div>
        </div>

        <Image
          src={Error404.src}
          alt="404 robot"
          width={400}
          height={300}
          priority
          className=""
        />
      </div>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center ">
        <h1 className="text-xl font-semibold text-gray-800 max-w-3xl leading-relaxed mb-2">
          Что-то пошло не так, ошибка была зафиксирована под ID{" "}
          <span className="text-gray-700 font-bold">139dj1243kks1ws</span>,{" "}
          <br />
          системный администратор был уведомлён.
        </h1>

        <p className="text-sm text-neutral-gray mb-4">
          Дата и время 16.02.2022 15:44
        </p>

        <p className="mb-6 text-gray-800 text-sm">
          Запрос будет перенаправлен на{" "}
          <Link
            href="/"
            className="text-red-600 font-semibold underline hover:text-red-500"
          >
            главную страницу
          </Link>{" "}
          через 9 секунд.
        </p>

        <Image
          src={Error500.src}
          alt="500 server error"
          width={400}
          height={300}
          priority
          className=""
        />
      </div>
    </div>
  );
}
