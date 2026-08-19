export class PlacementError extends Error {
	constructor(
		message: string,
		public code: 'INVALID_DATES' | 'OVERLAP' | 'NOT_FOUND' | 'INVALID_STATE' | 'UNAUTHORIZED',
		public statusCode: number = 400
	) {
		super(message);
		this.name = 'PlacementError';
	}
}

export class DateValidationError extends PlacementError {
	constructor(message: string) {
		super(message, 'INVALID_DATES', 400);
	}
}

export class OverlapError extends PlacementError {
	constructor(message: string) {
		super(message, 'OVERLAP', 409);
	}
}

export class NotFoundError extends PlacementError {
	constructor(message: string) {
		super(message, 'NOT_FOUND', 404);
	}
}

export class InvalidStateError extends PlacementError {
	constructor(message: string) {
		super(message, 'INVALID_STATE', 400);
	}
}

export function validateDates(startedDate: Date, endedDate?: Date) {
	if (endedDate && startedDate >= endedDate) {
		throw new DateValidationError('La date de fin doit être après la date de début');
	}
}
