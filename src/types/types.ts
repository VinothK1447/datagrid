export type GridHeaders = {
	name: string
	displayText: string
}

export type filterProps = {
	filterField: string
	filterOption: string
	filterValue: number
}

export type DataGridProps = {
	data: {}[]
	headers: String[]
	theme?: String
	bordered?: boolean
	totalPages?: number
}
