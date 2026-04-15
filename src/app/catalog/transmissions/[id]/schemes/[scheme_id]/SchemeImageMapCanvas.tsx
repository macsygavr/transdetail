"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

type RectArea = {
  code: string;
  coords: [number, number, number, number];
  label: string;
};

type ScaledRectArea = RectArea & {
  scaledCoords: [number, number, number, number];
};

type SchemeImageMapCanvasProps = {
  imageSrc: string;
  alt: string;
  mapMarkup: string | null | undefined;
  highlightedCodes: string[];
  onAreaSelect?: (code: string) => void;
};

function parsePartsMap(markup: string | null | undefined): RectArea[] {
  if (typeof window === "undefined" || !markup) return [];

  const parser = new DOMParser();
  const document = parser.parseFromString(markup, "text/html");

  return Array.from(document.querySelectorAll("area"))
    .map((node) => {
      const shape = node.getAttribute("shape")?.toLowerCase();
      const code = node.getAttribute("href")?.replace(/^#/, "").trim();
      const coordsRaw = node.getAttribute("coords");
      const label =
        node.getAttribute("alt")?.trim() ||
        node.getAttribute("title")?.trim() ||
        code ||
        "";

      if (shape !== "rect" || !code || !coordsRaw) {
        return null;
      }

      const coords = coordsRaw.split(",").map((value) => Number(value.trim()));

      if (coords.length !== 4 || coords.some((value) => Number.isNaN(value))) {
        return null;
      }

      return {
        code,
        coords: coords as [number, number, number, number],
        label,
      };
    })
    .filter((area): area is RectArea => area !== null);
}

function getContainLayout(
  boxWidth: number,
  boxHeight: number,
  imageWidth: number,
  imageHeight: number
) {
  const scale = Math.min(boxWidth / imageWidth, boxHeight / imageHeight);
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;
  const offsetX = (boxWidth - drawWidth) / 2;
  const offsetY = (boxHeight - drawHeight) / 2;

  return { scale, drawWidth, drawHeight, offsetX, offsetY };
}

export default function SchemeImageMapCanvas({
  imageSrc,
  alt,
  mapMarkup,
  highlightedCodes,
  onAreaSelect,
}: SchemeImageMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageError, setImageError] = useState(false);
  const [layout, setLayout] = useState<ReturnType<
    typeof getContainLayout
  > | null>(null);
  const [rectAreas, setRectAreas] = useState<RectArea[]>([]);
  const [imageLoadVersion, setImageLoadVersion] = useState(0);
  const highlightedCodesSet = useMemo(
    () => new Set(highlightedCodes),
    [highlightedCodes]
  );
  const mapId = `scheme-map-${useId().replace(/:/g, "")}`;
  const scaledRectAreas = useMemo<ScaledRectArea[]>(() => {
    if (!layout) {
      return [];
    }

    return rectAreas.map((area) => {
      const [x1, y1, x2, y2] = area.coords;

      return {
        ...area,
        scaledCoords: [
          Math.round(x1 * layout.scale),
          Math.round(y1 * layout.scale),
          Math.round(x2 * layout.scale),
          Math.round(y2 * layout.scale),
        ],
      };
    });
  }, [layout, rectAreas]);

  const drawCanvas = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const image = imageRef.current;

    if (!container || !canvas || !image) {
      return;
    }

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    if (containerWidth === 0 || containerHeight === 0) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(containerWidth * dpr);
    canvas.height = Math.round(containerHeight * dpr);
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, containerWidth, containerHeight);

    const nextLayout = getContainLayout(
      containerWidth,
      containerHeight,
      image.naturalWidth,
      image.naturalHeight
    );

    setLayout(nextLayout);

    const { scale, drawWidth, drawHeight, offsetX, offsetY } = nextLayout;

    context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

    rectAreas.forEach((area) => {
      if (!highlightedCodesSet.has(area.code)) {
        return;
      }

      const [x1, y1, x2, y2] = area.coords;
      const x = offsetX + x1 * scale;
      const y = offsetY + y1 * scale;
      const width = (x2 - x1) * scale;
      const height = (y2 - y1) * scale;

      context.fillStyle = "rgba(239, 67, 35, 0.22)";
      context.strokeStyle = "rgba(239, 67, 35, 0.95)";
      context.lineWidth = 2;
      context.fillRect(x, y, width, height);
      context.strokeRect(x, y, width, height);
    });
  }, [highlightedCodesSet, rectAreas]);

  useEffect(() => {
    setRectAreas(parsePartsMap(mapMarkup));
  }, [mapMarkup]);

  useEffect(() => {
    const image = new window.Image();
    let isCancelled = false;

    setImageError(false);
    setLayout(null);
    imageRef.current = null;

    image.onload = () => {
      if (isCancelled) {
        return;
      }

      imageRef.current = image;
      setImageLoadVersion((currentVersion) => currentVersion + 1);
    };

    image.onerror = () => {
      if (isCancelled) {
        return;
      }

      imageRef.current = null;
      setLayout(null);
      setImageError(true);
    };

    image.src = imageSrc;

    return () => {
      isCancelled = true;
      image.onload = null;
      image.onerror = null;
    };
  }, [imageSrc]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas, imageLoadVersion]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const observer = new ResizeObserver(() => {
      drawCanvas();
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [drawCanvas]);

  if (imageError) {
    return (
      <div className="flex min-h-[320px] items-center justify-center bg-gray-100 text-gray-400 md:min-h-[520px]">
        Не удалось загрузить изображение схемы
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative min-h-[320px] w-full bg-white md:min-h-[520px]"
      aria-label={alt}
      role="img"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
      {layout ? (
        <>
          <img
            src={imageSrc}
            alt=""
            aria-hidden="true"
            draggable={false}
            useMap={`#${mapId}`}
            className="absolute z-10 select-none opacity-0"
            width={Math.round(layout.drawWidth)}
            height={Math.round(layout.drawHeight)}
            style={{
              left: layout.offsetX,
              top: layout.offsetY,
              width: layout.drawWidth,
              height: layout.drawHeight,
            }}
          />
          <map name={mapId}>
            {scaledRectAreas.map((area) => {
              const isInteractive =
                highlightedCodesSet.has(area.code) &&
                typeof onAreaSelect === "function";

              return (
                <area
                  key={`${area.code}-${area.coords.join("-")}`}
                  shape="rect"
                  coords={area.scaledCoords.join(",")}
                  href={isInteractive ? `#${area.code}` : undefined}
                  alt={area.label}
                  title={area.label}
                  onClick={(event) => {
                    if (!isInteractive) {
                      event.preventDefault();
                      return;
                    }

                    event.preventDefault();
                    onAreaSelect(area.code);
                  }}
                />
              );
            })}
          </map>
        </>
      ) : null}
    </div>
  );
}
