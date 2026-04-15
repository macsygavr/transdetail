import { QueryClient } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { usePageBySlugQueryOptions } from "@cms/sdk/pages/hooks/queries";

import ContentContainer from "@/components/ContentContainer/ContentContainer";
import PageTitle from "@/components/PageTitle/PageTitle";
import { createServerCMSClientOptions } from "@/lib/cms-client-options";

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

type EditorJsBlockData = {
  text?: unknown;
  level?: unknown;
};

type EditorJsBlock = {
  id?: string;
  type?: string;
  data?: EditorJsBlockData;
};

function getPageBlocks(content: Record<string, unknown>): EditorJsBlock[] {
  const blocks = content.blocks;

  if (!Array.isArray(blocks)) {
    return [];
  }

  return blocks as EditorJsBlock[];
}

function getBlockText(block: EditorJsBlock): string {
  return typeof block.data?.text === "string" ? block.data.text : "";
}

function getHeaderTag(level: number) {
  switch (level) {
    case 1:
      return "h1";
    case 2:
      return "h2";
    case 3:
      return "h3";
    case 4:
      return "h4";
    case 5:
      return "h5";
    default:
      return "h6";
  }
}

function getHeaderClassName(level: number): string {
  switch (level) {
    case 1:
      return "text-2xl leading-[1.15] md:text-4xl";
    case 2:
      return "text-xl leading-[1.2] md:text-3xl";
    case 3:
      return "text-lg leading-[1.25] md:text-2xl";
    case 4:
      return "text-base leading-[1.3] md:text-xl";
    case 5:
      return "text-sm leading-[1.35] md:text-lg";
    default:
      return "text-sm leading-[1.4] md:text-base";
  }
}

function renderBlock(block: EditorJsBlock, index: number) {
  const key = block.id ?? `${block.type ?? "block"}-${index}`;

  switch (block.type) {
    case "paragraph": {
      const text = getBlockText(block);

      if (!text.trim()) {
        return null;
      }

      return (
        <p
          key={key}
          className="text-[14px] leading-[24px] md:text-[16px] md:leading-[28px]"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );
    }
    case "header": {
      const text = getBlockText(block);
      const rawLevel = block.data?.level;
      const level =
        typeof rawLevel === "number" && rawLevel >= 1 && rawLevel <= 6
          ? rawLevel
          : 2;

      if (!text.trim()) {
        return null;
      }

      const Tag = getHeaderTag(level);

      return (
        <Tag
          key={key}
          className={`font-medium text-text ${getHeaderClassName(level)}`}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );
    }
    default:
      return null;
  }
}

export default async function Page({ params }: PageProps) {
  const [{ slug }, cookieStore] = await Promise.all([params, cookies()]);
  const pageSlug = slug.join("/");
  const client = new QueryClient();
  const clientOptions = createServerCMSClientOptions(cookieStore.toString());

  try {
    const page = await client.fetchQuery(
      usePageBySlugQueryOptions({
        clientOptions,
        params: {
          slug: pageSlug,
          is_published: true,
        },
      })
    );

    const blocks = getPageBlocks(page.content);
    const renderedBlocks = blocks
      .map((block, index) => renderBlock(block, index))
      .filter((block) => block !== null);

    if (!page.title && renderedBlocks.length === 0) {
      notFound();
    }

    return (
      <ContentContainer>
        <div className="text-text">
          {page.title ? <PageTitle>{page.title}</PageTitle> : null}

          {renderedBlocks.length > 0 ? (
            <div className="space-y-4 md:space-y-6">{renderedBlocks}</div>
          ) : (
            <div className="rounded-[10px] border border-neutral-gray-deep p-4 md:p-6">
              Содержимое страницы пока недоступно.
            </div>
          )}
        </div>
      </ContentContainer>
    );
  } catch {
    notFound();
  }
}
