"use client";

import { useState } from "react";
import { FaSolarPanel, FaCalculator, FaIndustry } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useTranslations } from "next-intl";

interface CarouselCard {
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
}

export default function CardCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const t = useTranslations("home.carousel");

  const cards: CarouselCard[] = [
    {
      icon: <FaSolarPanel className="w-6 h-6 text-[var(--accent)] mb-1" />,
      title: t("card1Title"),
      content: (
        <>
          <p className="text-xs text-[var(--text-body)] mb-1">
            {t("card1Desc")}
          </p>
          <ul className="space-y-0.5 text-xs text-[var(--text-body)] list-disc list-inside">
            <li>{t("card1Item1")}</li>
            <li>{t("card1Item2")}</li>
            <li>{t("card1Item3")}</li>
            <li>{t("card1Item4")}</li>
          </ul>
        </>
      ),
    },
    {
      icon: <FaCalculator className="w-6 h-6 text-[var(--accent)] mb-1" />,
      title: t("card2Title"),
      content: (
        <>
          <p className="text-xs text-[var(--text-body)] mb-1">
            {t("card2Desc")}
          </p>
          <ul className="space-y-0.5 text-xs text-[var(--text-body)] mb-2 list-disc list-inside">
            <li>{t("card2Item1")}</li>
            <li>{t("card2Item2")}</li>
            <li>{t("card2Item3")}</li>
            <li>{t("card2Item4")}</li>
          </ul>
          <p className="text-xs text-[var(--text-body)]">{t("card2Footer")}</p>
        </>
      ),
    },
    {
      icon: <FaIndustry className="w-6 h-6 text-[var(--accent)] mb-1" />,
      title: t("card3Title"),
      content: (
        <>
          <p className="text-xs text-[var(--text-body)] mb-1">
            {t("card3Desc")}
          </p>
          <ul className="space-y-0.5 text-xs text-[var(--text-body)] list-disc list-inside">
            <li>{t("card3Item1")}</li>
            <li>{t("card3Item2")}</li>
            <li>{t("card3Item3")}</li>
            <li>{t("card3Item4")}</li>
          </ul>
        </>
      ),
    },
  ];

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? cards.length - 1 : prevIndex - 1,
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === cards.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const getCardPosition = (index: number) => {
    const diff = index - currentIndex;
    if (diff === 0) return "center";
    if (diff === 1 || diff === -(cards.length - 1)) return "right";
    if (diff === -1 || diff === cards.length - 1) return "left";
    return "hidden";
  };

  return (
    <section className="relative w-full py-4 md:py-8 lg:py-8 overflow-hidden">
      <div className="flex items-center justify-center gap-8">
        <button
          onClick={handlePrevious}
          className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--accent)] text-white flex items-center justify-center hover:opacity-90 transition-opacity z-10"
          aria-label="Previous card"
        >
          <IoIosArrowBack className="w-6 h-6" />
        </button>

        <div className="relative flex items-center justify-center w-full max-w-6xl h-[500px]">
          {cards.map((card, index) => {
            const position = getCardPosition(index);
            const isCenter = position === "center";
            const isLeft = position === "left";
            const isRight = position === "right";

            return (
              <div
                key={index}
                className={`
                  absolute transition-all duration-500 ease-in-out
                  bg-[var(--card)] rounded-lg p-4
                  ${isCenter ? "scale-150 z-20 opacity-100" : "scale-100 z-10 opacity-60"}
                  ${isLeft ? "-translate-x-[450px]" : ""}
                  ${isRight ? "translate-x-[450px]" : ""}
                  ${position === "hidden" ? "opacity-0 pointer-events-none" : ""}
                  w-72 h-80
                `}
                style={{ boxShadow: "var(--card-shadow)" }}
              >
                <div className="flex flex-col items-center text-center">
                  {card.icon}
                  <h2 className="text-sm font-bold text-[var(--text-heading)] mb-1">
                    {card.title}
                  </h2>
                  <div className="text-left">{card.content}</div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleNext}
          className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--accent)] text-white flex items-center justify-center hover:opacity-90 transition-opacity z-10"
          aria-label="Next card"
        >
          <IoIosArrowForward className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
}
