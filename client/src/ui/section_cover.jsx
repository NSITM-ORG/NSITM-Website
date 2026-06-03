import React from "react";

export default function SectionCover({
  children,
  title,
  sub_title,
  buttonText,
}) {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            {/* <Star className="w-6 h-6 text-secondary fill-current" /> */}
            <h2 className=" text-[2rem] sm:text-[4rem] font-bold text-user-primary-darkGray ">
              {title}
            </h2>
            {/* <Star className="w-6 h-6 text-secondary fill-current" /> */}
          </div>
          <p className="text-xl text-user-primary-darkGray max-w-2xl mx-auto">
            {sub_title}
          </p>
        </div>
        {children}
        <button
          className={`${
            buttonText ? "flex" : "hidden"
          } items-center justify-center gap-2 mt-8 px-6 py-3 text-lg rounded-md border border-solid font-semibold border-user-primary text-user-primary hover:text-white hover:bg-green-600 transition-all duration-700 mx-auto`}
        >
          <span>{buttonText}</span>
        </button>
      </div>
    </section>
  );
}
