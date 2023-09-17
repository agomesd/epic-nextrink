import { z } from 'zod'

const RecordFieldsetSchema = z.object({
	id: z.string().optional(),
	wins: z.number().optional(),
	losses: z.number().optional(),
	ties: z.number().optional(),
	played: z.number().optional(),
	points: z.number().optional(),
	francJeux: z.number().optional(),
	goalsFor: z.number().optional(),
	goalsAgainst: z.number().optional(),
	plusMinus: z.number().optional(),
})

const TeamEditorSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(3).max(20),
	associationId: z.string().optional(),
	levelId: z.string().optional(),
	caliberId: z.string().optional(),
	roster: z.string().array(),
	coachId: z.string().optional(),
	supportStaff: z.string().array(),
	preferedArenas: z.string().array(),
	record: RecordFieldsetSchema,
	homeGameIds: z.string().array(),
	awayGameIds: z.string().array(),
	parctices: z.string().array(),
	winIds: z.string().array(),
	lossIds: z.string().array(),
	depthChartIds: z.string().array(),
})
