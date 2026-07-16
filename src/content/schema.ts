import { z } from "zod";
import type { ServiceOnePagerContent } from "./types";

/** Non-empty after trim on both languages */
export const biStringSchema = z.object({
  zh: z.string().trim().min(1),
  en: z.string().trim().min(1),
});

export function biStringMax(zhMax: number, enMax: number) {
  return z.object({
    zh: z.string().trim().min(1).max(zhMax),
    en: z.string().trim().min(1).max(enMax),
  });
}

export function biStringMinMax(
  zhMin: number,
  zhMax: number,
  enMin: number,
  enMax: number,
) {
  return z.object({
    zh: z.string().trim().min(zhMin).max(zhMax),
    en: z.string().trim().min(enMin).max(enMax),
  });
}

const deliverableItemSchema = z.object({
  id: z.string().trim().min(1),
  label: biStringMax(32, 48),
  detail: biStringSchema.optional(),
  mandatory: z.boolean().optional(),
});

/** Requirements items default mandatory to true at parse time. */
const requirementItemSchema = z.object({
  id: z.string().trim().min(1),
  label: biStringMax(32, 48),
  detail: biStringSchema.optional(),
  mandatory: z.boolean().default(true),
});

const brandSchema = z.object({
  companyName: biStringSchema,
  logoSrc: z.string().trim().min(1).optional(),
  accentColor: z.string().trim().min(1).optional(),
  contactLine: z.string().trim().min(1).optional(),
  wechatId: z.string().trim().min(1).optional(),
  qrSrc: z.string().trim().min(1).optional(),
  legalLine: biStringSchema.optional(),
  ctaLabel: biStringSchema.optional(),
  ctaDetail: biStringSchema.optional(),
});

/** Standalone brand defaults file validation */
export const brandConfigSchema = brandSchema;

const productNameSchema = z.object({
  // Base max 24; superRefine tightens to 16 when tagline is set
  zh: z.string().trim().min(2).max(24),
  en: z.string().trim().min(2).max(40),
});

const layoutSchema = z
  .object({
    variant: z.enum(["stack", "split"]).optional(),
    density: z.enum(["normal", "compact"]).optional(),
    showHighlights: z.boolean().optional(),
    showQr: z.boolean().optional(),
    dropOptionalIfTight: z.boolean().optional(),
    softPanelOn: z.enum(["requirements", "deliverables", "none"]).optional(),
    bilingual: z.literal(true).optional(),
  })
  .optional();

export const productSchema = z
  .object({
    templateId: z.literal("a4-service-onepager-v1"),
    locale: z.literal("zh-CN-en"),
    meta: z.object({
      documentTitle: biStringSchema,
      version: z.string().trim().min(1),
      confidential: z.boolean().optional(),
      updatedAt: z.string().trim().min(1).optional(),
      disclaimer: biStringSchema.optional(),
      cycleLabel: biStringSchema.optional(),
      priceBand: biStringSchema.optional(),
    }),
    product: z.object({
      name: productNameSchema,
      categoryLabel: biStringSchema.optional(),
      tagline: biStringMax(40, 56).optional(),
    }),
    targetCustomer: z.object({
      title: biStringSchema.optional(),
      summary: biStringMinMax(8, 72, 8, 90),
      segments: z.array(biStringMax(12, 18)).max(6).optional(),
      profiles: z.array(biStringSchema).max(3).optional(),
    }),
    deliverables: z.object({
      title: biStringSchema.optional(),
      intro: biStringSchema.optional(),
      items: z.array(deliverableItemSchema).min(1).max(6),
    }),
    requirements: z.object({
      title: biStringSchema.optional(),
      intro: biStringSchema.optional(),
      items: z.array(requirementItemSchema).min(1).max(8),
    }),
    highlights: z
      .object({
        title: biStringSchema.optional(),
        items: z.array(biStringMax(28, 40)).min(1).max(4),
      })
      .optional(),
    timeline: z
      .object({
        title: biStringSchema.optional(),
        steps: z
          .array(
            z.object({
              id: z.string().trim().min(1),
              label: biStringSchema,
              timeHint: biStringSchema.optional(),
            }),
          )
          .min(1)
          .max(4),
      })
      .optional(),
    brand: brandSchema,
    layout: layoutSchema,
  })
  .superRefine((data, ctx) => {
    const nameZhMax = data.product.tagline ? 16 : 24;
    if (data.product.name.zh.length > nameZhMax) {
      ctx.addIssue({
        code: "custom",
        path: ["product", "name", "zh"],
        message: data.product.tagline
          ? "product.name.zh max 16 when tagline is set"
          : "product.name.zh max 24",
      });
    }

    if (data.highlights !== undefined && data.timeline !== undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["highlights"],
        message: "highlights and timeline are mutually exclusive",
      });
      ctx.addIssue({
        code: "custom",
        path: ["timeline"],
        message: "highlights and timeline are mutually exclusive",
      });
    }
  });

export type ProductSchemaOutput = z.infer<typeof productSchema>;

/**
 * Type-level guard: schema output must remain assignable to the hand-written
 * ServiceOnePagerContent interface (catches drift without a cast at call sites).
 */
type AssertAssignable<T, U extends T> = U;
type _SchemaMatchesTypes = AssertAssignable<
  ServiceOnePagerContent,
  ProductSchemaOutput
>;
// Touch the type so unused-type elimination does not drop the check in some tools.
const _schemaMatchesTypes: _SchemaMatchesTypes | undefined = undefined;
void _schemaMatchesTypes;

/** Validate raw JSON; throws ZodError on failure. */
export function parseProduct(raw: unknown): ServiceOnePagerContent {
  const parsed: ProductSchemaOutput = productSchema.parse(raw);
  // Assignability checked above; explicit annotation keeps return type stable.
  const content: ServiceOnePagerContent = parsed;
  return content;
}

/** Safe parse for tooling / tests. */
export function safeParseProduct(raw: unknown) {
  return productSchema.safeParse(raw);
}
