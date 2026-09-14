import Image from "next/image";
import Link from "next/link";

const Page = () => {
  return (
    <main className="root-container">
      <div className="mx-auto max-w-7xl">
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <Image
            src="/icons/warning.svg"
            alt="warning"
            width={56}
            height={56}
          />

          <h1 className="mt-6 text-4xl font-semibold text-white md:text-5xl">
            WHOA, SLOW DOWN THERE, SPEEDY!
          </h1>

          <p className="mt-3 max-w-md text-lg text-light-100">
            Looks like you&apos;ve been a little too eager. We&apos;ve put a
            temporary pause on your excitement. Chill for a bit, and try again
            shortly
          </p>

          <Link href="/sign-in" className="form-btn mt-8 min-w-[360px]">
            Back
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Page;
