import { useEffect, useLayoutEffect, useRef, useState } from "react";

const useSticky = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [sticked, setSticked] = useState(false);

  const unstickedHeightRef = useRef<number | null>(null);
  useEffect(() => {
    if (!ref.current) return;

    const top = parseInt(getComputedStyle(ref.current).top);
    if (isNaN(top)) {
      throw new Error(
        "The sticky element must have a top CSS property with a valid number value."
      );
    }

    const observer = new IntersectionObserver(
      ([e]) => {
        const newSticked =
          e.intersectionRect.height < e.boundingClientRect.height;
        if (sticked !== newSticked) {
          setSticked(newSticked);
        }
      },
      { threshold: [1], rootMargin: `-${top + 1}px 9999px 0px` }
    );
    observer.observe(ref.current);
  }, [ref, sticked]);

  useLayoutEffect(() => {
    if (!ref.current) return;

    unstickedHeightRef.current = ref.current.clientHeight;
  }, [ref]);

  useEffect(() => {
    const handleWindowResize = () => {
      if (!ref.current) return;
      unstickedHeightRef.current = sticked ? null : ref.current.clientHeight;
    };

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [ref, sticked]);

  // When the element becomes sticky, if the height of the sticked element is smaller
  // than the element when it's not sticked, scroll anchoring will cause the sticky
  // element to move down from the sticky point -> it becomes unsticked again,
  // which will cause the element to expand, which causes the element to get
  // sticky -> the cycle repeats.
  // To counter this, the height of the sticked element must be greater than or equal
  // to the unsticked element. Add a margin bottom to compenstate.
  const [heightToCompensateWhenSticked, setHeightToCompensateWhenSticked] =
    useState(0);
  useLayoutEffect(() => {
    if (sticked) {
      setHeightToCompensateWhenSticked(
        Math.max(
          0,
          (unstickedHeightRef.current || 0) - (ref.current?.clientHeight || 0)
        )
      );
    }
  }, [ref, sticked]);

  return {
    ref,
    sticked,
    heightToCompensateWhenSticked,
  };
};

export { useSticky };
