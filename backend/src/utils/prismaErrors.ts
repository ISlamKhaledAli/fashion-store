import { Prisma } from "@prisma/client";
import { NotFoundError, ConflictError } from "./AppError";

/**
 * Type guard to check if an error is a PrismaClientKnownRequestError
 */
export function isPrismaError(
  error: unknown
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

/**
 * Checks if error is a Prisma "Record Not Found" error (P2025)
 */
export function isNotFoundError(error: unknown): boolean {
  return isPrismaError(error) && error.code === "P2025";
}

/**
 * Checks if error is a Prisma "Unique constraint failed" error (P2002)
 */
export function isUniqueConstraintError(error: unknown): boolean {
  return isPrismaError(error) && error.code === "P2002";
}

/**
 * Maps a Prisma P2025 error to a domain NotFoundError, or returns null if not matching
 */
export function mapPrismaNotFound(
  error: unknown,
  resourceName: string
): NotFoundError | null {
  if (isNotFoundError(error)) {
    return new NotFoundError(`${resourceName} not found`);
  }
  return null;
}
