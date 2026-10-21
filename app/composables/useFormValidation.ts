import { reactive } from "vue";
import type { z } from "zod";

export function useFormValidation() {
    const errors = reactive<Record<string, string>>({});

    const validate = <T extends z.ZodType>(schema: T, data: z.infer<T>) => {
        Object.keys(errors).forEach((key) => delete errors[key]);
        const result = schema.safeParse(data);
        if (!result.success) {
            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as string;
                if (!errors[field]) errors[field] = issue.message;
            });
            return false;
        }
        return true;
    };

    return { errors, validate };
}