import { z } from "zod";
import type { ServiceOnePagerContent } from "./types";

/** Non-empty Chinese string after trim */
export const zhStringSchema = z.string().trim().min(1);

export function zhStringMax(max: number) {
  return z.string().trim().min(1).max(max);
}

export function zhStringMinMax(min: number, max: number) {
  return z.string().trim().min(min).max(max);
}

const deliverableItemSchema = z.object({
  id: z.string().trim().min(1),
  label: zhStringMax(32),
  detail: zhStringSchema.optional(),
  mandatory: z.boolean().optional(),
});

/** Requirements items default mandatory to true at parse time. */
const requirementItemSchema = z.object({
  id: z.string().trim().min(1),
  label: zhStringMax(32),
  detail: zhStringSchema.optional(),
  mandatory: z.boolean().default(true),
});

const brandSchema = z.object({
  companyName: zhStringSchema,
  logoSrc: z.string().trim().min(1).optional(),
  accentColor: z.string().trim().min(1).optional(),
  contactLine: z.string().trim().min(1).optional(),
  wechatId: z.string().trim().min(1).optional(),
  qrSrc: z.string().trim().min(1).optional(),
  legalLine: zhStringSchema.optional(),
  ctaLabel: zhStringSchema.optional(),
  ctaDetail: zhStringSchema.optional(),
});

/** Standalone brand defaults file validation */
export const brandConfigSchema = brandSchema;

/** Base max 24; superRefine tightens to 16 when tagline is set */
const productNameSchema = z.string().trim().min(2).max(24);

const layoutSchema = z
  .object({
    variant: z.enum(["stack", "split"]).optional(),
    density: z.enum(["normal", "compact"]).optional(),
    showHighlights: z.boolean().optional(),
    showQr: z.boolean().optional(),
    dropOptionalIfTight: z.boolean().optional(),
    softPanelOn: z.enum(["requirements", "deliverables", "none"]).optional(),
  })
  .optional();

export const productSchema = z
  .object({
    templateId: z.literal("a4-service-onepager-v1"),
    locale: z.literal("zh-CN"),
    meta: z.object({
      documentTitle: zhStringSchema,
      version: z.string().trim().min(1),
      confidential: z.boolean().optional(),
      updatedAt: z.string().trim().min(1).optional(),
      disclaimer: zhStringSchema.optional(),
      cycleLabel: zhStringSchema.optional(),
      priceBand: zhStringSchema.optional(),
    }),
    product: z.object({
      name: productNameSchema,
      categoryLabel: zhStringSchema.optional(),
      tagline: zhStringMax(40).optional(),
    }),
    targetCustomer: z.object({
      title: zhStringSchema.optional(),
      summary: zhStringMinMax(8, 72),
      segments: z.array(zhStringMax(12)).max(6).optional(),
      profiles: z.array(zhStringSchema).max(3).optional(),
    }),
    deliverables: z.object({
      title: zhStringSchema.optional(),
      intro: zhStringSchema.optional(),
      items: z.array(deliverableItemSchema).min(1).max(6),
    }),
    requirements: z.object({
      title: zhStringSchema.optional(),
      intro: zhStringSchema.optional(),
      items: z.array(requirementItemSchema).min(1).max(8),
    }),
    highlights: z
      .object({
        title: zhStringSchema.optional(),
        items: z.array(zhStringMax(28)).min(1).max(4),
      })
      .optional(),
    timeline: z
      .object({
        title: zhStringSchema.optional(),
        steps: z
          .array(
            z.object({
              id: z.string().trim().min(1),
              label: zhStringSchema,
              timeHint: zhStringSchema.optional(),
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
    const nameMax = data.product.tagline ? 16 : 24;
    if ([...data.product.name].length > nameMax) {
      ctx.addIssue({
        code: "custom",
        path: ["product", "name"],
        message: data.product.tagline
          ? "product.name max 16 when tagline is set"
          : "product.name max 24",
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

type AssertAssignable<T, U extends T> = U;
type _SchemaMatchesTypes = AssertAssignable<
  ServiceOnePagerContent,
  ProductSchemaOutput
>;
const _schemaMatchesTypes: _SchemaMatchesTypes | undefined = undefined;
void _schemaMatchesTypes;

/** Validate raw JSON; throws ZodError on failure. */
export function parseProduct(raw: unknown): ServiceOnePagerContent {
  const parsed: ProductSchemaOutput = productSchema.parse(raw);
  const content: ServiceOnePagerContent = parsed;
  return content;
}

/** Safe parse for tooling / tests. */
export function safeParseProduct(raw: unknown) {
  return productSchema.safeParse(raw);
}
