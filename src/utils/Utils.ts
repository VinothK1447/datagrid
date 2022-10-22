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
		const dataArray: any = rows.map((row) => {
			const values = row.split(delim)
			const obj = headers.reduce((obj: any, header, i) => {
				if (!Utils.isEmpty(header)) {
					obj[header] = values[i]
					return obj
				}
			}, {})
			return obj
		})
		// const paginatedData = Utils.paginateData(dataArray)
		// return { headers, dataArray: paginatedData.pages }
		return { headers, dataArray }
	}

	static paginateData = (dataArray: any) => {
		let noOfPages = Math.ceil(dataArray.length / APP_CONSTANTS.ROWS_PER_PAGE)
		let res = []
		let idx = 0
		while (idx < dataArray.length) {
			res.push(dataArray.slice(idx, idx + APP_CONSTANTS.ROWS_PER_PAGE))
			idx += APP_CONSTANTS.ROWS_PER_PAGE
		}

		return {
			totalPages: noOfPages,
			pages: res
		}
	}
}

export default Utils
