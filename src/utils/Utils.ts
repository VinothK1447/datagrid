import { APP_CONSTANTS } from './Constants'

class Utils {
	static isEmpty = (value: any) => {
		return (
			value === undefined ||
			value === null ||
			(typeof value === 'object' && Object.keys(value).length === 0) ||
			(typeof value === 'string' && value.trim().length === 0) ||
			(Array.isArray(value) && value.length === 0)
		)
	}

	static isObject = (object: Object) => {
		return object != null && typeof object === 'object' && Object.keys(object).length > 0
	}

	static processCSV = (str: string, delim: string = ',') => {
		let headers: string[] = str.slice(0, str.indexOf('\n')).split(delim)
		const rows = str.slice(str.indexOf('\n') + 1).split('\n')
		headers = headers.filter((header) => !Utils.isEmpty(header))
		let dataArray: any = []
		if (rows && rows[0]) {
			dataArray = rows.map((row) => {
				const values = row.split(delim)
				const obj = headers.reduce((obj: any, header, i) => {
					if (!Utils.isEmpty(header)) {
						if (APP_CONSTANTS.DATE_PARSER.includes(header)) {
							values[i] = values[i] ? new Intl.DateTimeFormat('en-IN').format(new Date(values[i])) : values[i]
						}
						obj[header] = values[i]
						return obj
					}
				}, {})
				return obj
			})
		}
		let totalPages = Math.ceil(dataArray.length / APP_CONSTANTS.ROWS_PER_PAGE)
		// const paginatedData = Utils.paginateData(dataArray)
		// return { headers, dataArray: paginatedData.pages }
		return { headers, dataArray, totalPages }
	}

	static paginateData = (dataArray: any) => {
		let totalPages = Math.ceil(dataArray.length / APP_CONSTANTS.ROWS_PER_PAGE)
		let res: any = []
		let idx = 0
		while (idx < dataArray.length) {
			res.push(dataArray.slice(idx, idx + APP_CONSTANTS.ROWS_PER_PAGE))
			idx += APP_CONSTANTS.ROWS_PER_PAGE
		}

		return {
			totalPages: totalPages,
			pages: res
		}
	}

	static sortData = (data: any, sort: any) => {
		if (!Utils.isEmpty(data)) {
			const { field, order } = sort
			data = data.sort((a: any, b: any) => {
				if (APP_CONSTANTS.NUM_SORT.includes(field)) {
					if (+a[field] < +b[field]) {
						return order === 'asc' ? -1 : 1
					}
					if (+a[field] > +b[field]) {
						return order === 'asc' ? 1 : -1
					}
				} else {
					if (a[field] < b[field]) {
						return order === 'asc' ? -1 : 1
					}
					if (a[field] > b[field]) {
						return order === 'asc' ? 1 : -1
					}
				}
				return 0
			})
			return data
		} else {
			return data
		}
	}

	static debouncer = (fn: Function, delay: number) => {
		let timer: any
		return function delayed(...args: any) {
			clearTimeout(timer)
			timer = setTimeout(() => {
				timer = null
				fn(...args)
			}, delay)
		}
	}
}

export default Utils
