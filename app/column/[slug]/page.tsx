import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleToc, type TocItem } from "@/components/ArticleToc";
import { ButtonLink } from "@/components/ButtonLink";
import { ColumnHeader } from "@/components/ColumnHeader";
import { FaqList } from "@/components/FaqList";
import { ImageSlot } from "@/components/ImageSlot";
import { columns, getColumn } from "@/content/columns";
import { detailContent, doctor } from "@/content/site";
import { getCategory } from "@/content/treatments";
import styles from "./page.module.css";

type ColumnDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return columns.map((column) => ({ slug: column.slug }));
}

export async function generateMetadata({ params }: ColumnDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const column = getColumn(slug);
  if (!column) return {};
  return {
    title: `${column.title} | 언주역 글로리의원`,
    description: column.summary,
  };
}

export default async function ColumnDetailPage({ params }: ColumnDetailPageProps) {
  const { slug } = await params;
  const column = getColumn(slug);
  if (!column) notFound();

  const category = getCategory(column.categorySlug);
  const tocItems: TocItem[] = [
    { id: "summary", label: "이 글의 핵심" },
    ...column.sections.map((section) => ({ id: section.id, label: `${section.no} ${section.heading}` })),
    { id: "judgement", label: "03 권하는 경우 · 아닌 경우" },
    { id: "precautions", label: "04 시술 전 확인 · FAQ" },
  ];

  return (
    <main className="pageFrame">
      <ColumnHeader />

      <section className={styles.titleArea}>
        <div className={styles.breadcrumb}>{detailContent.breadcrumb.join(" > ")}</div>
        <div className={styles.category}>{category?.name}</div>
        <h1>{column.title}</h1>
        <div className={styles.authorLine}>
          <span className={styles.authorAvatar} aria-hidden="true" />
          <span>
            <b>{column.author}</b> · 게시 {column.publishedAt} · 수정 {column.updatedAt} · 읽는 시간 {column.readMinutes}분
          </span>
          <span className={styles.reviewed}>대표원장 검토 완료 · {column.reviewedAt}</span>
        </div>
        {column.questionSource ? (
          <div className={styles.questionSource}>{column.questionSource}</div>
        ) : null}
      </section>

      <div className={styles.bodyLayout}>
        <article className={styles.article}>
          <section className={styles.summary} id="summary">
            <b>{detailContent.coreTitle}</b>
            <p>{column.summary}</p>
            <div className={styles.keyPoints}>
              <b>핵심 포인트</b>
              <ul>
                {column.keyPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </section>

          <figure className={styles.photoFigure}>
            <ImageSlot className={styles.heroPhoto} label={column.photo.label} alt={column.photo.alt} />
            <figcaption>{column.photo.caption}</figcaption>
          </figure>

          <ArticleToc items={tocItems} title={detailContent.tocTitle} compact />

          {column.sections.map((section) => (
            <section className={styles.articleSection} id={section.id} key={section.id}>
              <h2>
                <span>{section.no}</span> {section.heading}
              </h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.figure ? (
                <figure className={styles.diagramFigure}>
                  <ImageSlot
                    className={styles.diagram}
                    label={section.figure.label}
                    alt={section.figure.label.replace("\n", " ")}
                    variant="diagram"
                  />
                  <figcaption>{section.figure.caption}</figcaption>
                </figure>
              ) : null}
              {section.table ? (
                <div className={styles.tableScroll}>
                  <table>
                    <thead>
                      <tr>
                        {section.table.head.map((cell) => (
                          <th key={cell} scope="col">{cell}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row) => (
                        <tr key={row.join("-")}>
                          {row.map((cell, index) => index === 0 ? (
                            <th key={cell} scope="row">{cell}</th>
                          ) : (
                            <td key={`${cell}-${index}`}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
              {section.table ? <small>개인차 안내 문구 · 수치를 쓰면 출처를 참고 자료에 연결</small> : null}
            </section>
          ))}

          <section className={styles.judgement} id="judgement">
            <h2><span>03</span> {detailContent.judgementTitle}</h2>
            <div className={styles.judgementGrid}>
              <div>
                <b>권하는 경우</b>
                <ul>{column.judgement.recommend.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              <div>
                <b>권하지 않거나 다른 시술을 먼저 보는 경우</b>
                <ul>{column.judgement.notRecommend.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            </div>
          </section>

          {column.video ? (
            <section className={styles.videoSection}>
              <h2>{detailContent.videoTitle}</h2>
              <div className={styles.videoSlot} role="img" aria-label={column.video.label}>
                <span className={styles.playButton}>▶</span>
                <span>{column.video.label}</span>
              </div>
              <div className={styles.transcript}><b>영상 대본</b> · {column.video.transcript}</div>
            </section>
          ) : null}

          <div id="precautions" className={styles.precautionsGroup}>
            <section className={styles.precautions}>
              <h2><span>04</span> {detailContent.precautionsTitle}</h2>
              <ul>{column.precautions.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
            <section className={styles.faqSection}>
              <h2>{detailContent.faqTitle}</h2>
              <FaqList items={column.faqs} />
            </section>
          </div>

          <section className={styles.references}>
            <h2>{detailContent.referencesTitle}</h2>
            <ul>{column.references.map((item) => <li key={item}>{item}</li>)}</ul>
            <small>본문에 수치(온도·주파수 등)를 쓰면 반드시 여기에 출처 연결</small>
          </section>

          <section className={styles.authorBox}>
            <ImageSlot label="" alt="대표원장 이호 프로필 사진" width={120} height={140} />
            <div>
              <h2>{detailContent.authorTitle}</h2>
              <p>{detailContent.authorCareer}</p>
              <p>게시 {column.publishedAt} · 수정 {column.updatedAt} · 검토 {column.reviewedAt}</p>
              <Link href="/">원장 프로필 →</Link>
            </div>
          </section>

          <section className={styles.treatmentCta}>
            <div>
              <b>{detailContent.treatmentTitle}</b>
              <span>{detailContent.treatmentDescription}</span>
            </div>
            <div className={styles.ctaButtons}>
              <ButtonLink href="#" variant="taupe">예약·상담</ButtonLink>
              <ButtonLink href="#" variant="lightOutline">카톡 상담</ButtonLink>
            </div>
          </section>

          <section className={styles.related}>
            <h2>{detailContent.relatedTitle}</h2>
            <div className={styles.relatedGrid}>
              {detailContent.related.map((title) => (
                <div key={title}>
                  <ImageSlot label="" alt={`${title} 대표 이미지`} height={120} />
                  <b>{title}</b>
                </div>
              ))}
            </div>
            <div className={styles.articleNav}>
              <span>← 이전 글 [제목]</span>
              <span>다음 글 [제목] →</span>
            </div>
          </section>

          <div className={styles.notice}>{detailContent.notice}</div>
        </article>

        <aside className={styles.sidebar}>
          <div className={styles.stickySidebar}>
            <ArticleToc items={tocItems} title="목차" />
            <div className={styles.doctorCard}>
              <div>
                <span aria-hidden="true" />
                <b>{doctor.title} {doctor.name}</b>
              </div>
              <p>상담부터 시술까지 직접 진행합니다.</p>
              <ButtonLink href="#" variant="taupe">예약·상담 02-6958-7525</ButtonLink>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
