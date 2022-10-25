import React, { useCallback, useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import { DataGridProps } from '../../types/types'
import Utils from '../../utils/Utils'
import './styles/datagrid.scss'
import { APP_CONSTANTS, STATIC_STRINGS } from '../../utils/Constants'
import Spinner from '../Spinner/Spinner'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilter, faSearch, faSortUp, faSortDown, faCircleXmark, faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons'
import { useOutsideClicks } from '../../utils/useOutsideClicks'

function DataGrid(props: DataGridProps) {
	const ROW_CAP = APP_CONSTANTS.ROWS_PER_PAGE
	const { data, headers, totalPages = 0, bordered } = props

	// Refs for loader, search box, filter and last element indicator
	const loader = useRef<any>(null)
	const lastElemRef = useRef<HTMLDivElement>(null)
	const searchElemRef = useRef<any>()
	const filterBubble = useRef<HTMLDivElement>(null)

	// State related to data values & theme
	const [allData, setAllData] = useState(data)
	const [lastIndex, setLastIndex] = useState(0)
	const [fragmentedData, setFragmentedData] = useState<{}[]>([])
	const [theme, setTheme] = useState<any>('light')

	// State related to pagination
	const [pageNum, setPageNum] = useState(0)
	const [showSpinner, setShowSpinner] = useState(false)

	// State related to sort
	const [sort, setSort] = useState({ field: 'SYMBOL', order: 'asc' })

	// State related to search & filter
	const [searchText, setSearchText] = useState('')
	const [showFilter, setShowFilter] = useState(false)
	const [filters, setFilters] = useState({ filterField: '', filterOption: '', filterValue: 0 })
	const [filterField, setFilterField] = useState('')
	const [filterOption, setFilterOption] = useState('')
	const [filterValue, setFilterValue] = useState(0)

	// Icons - search, sort, filter
	const sortAsc = <FontAwesomeIcon icon={faSortUp} />
	const sortDesc = <FontAwesomeIcon icon={faSortDown} />
	const filterIcon = <FontAwesomeIcon icon={faFilter} />
	const searchIcon = <FontAwesomeIcon icon={faSearch} />
	const searchCloseIcon = <FontAwesomeIcon icon={faCircleXmark} />

	// Side effects for state data, sort, filters starts here
	useEffect(() => {
		if (!Utils.isEmpty(allData)) {
			sliceData()
			setShowSpinner(true)
		}
	}, [allData])

	useEffect(() => {
		const opts = {
			root: null,
			rootMargin: '0px 0px 25px 0px',
			threshold: 0.5
		}
		const cb = (entries: any) => {
			if (entries[0].isIntersecting) {
				sliceData()
			}
		}
		loader.current = new IntersectionObserver(cb, opts)
		if (lastElemRef.current) {
			loader.current.observe(lastElemRef.current)
		}
	}, [lastIndex, sort])

	useEffect(() => {
		if (!Utils.isEmpty(fragmentedData)) {
			let currentData = Utils.sortData(fragmentedData, sort)
			setSort(sort)
			setFragmentedData(currentData)
		}
	}, [fragmentedData, sort])

	useEffect(() => {
		setSearchText(searchText)
	}, [searchText])

	useEffect(() => {
		setFilters({ ...filters, filterField, filterOption, filterValue })
	}, [filterField, filterOption, filterValue])

	useEffect(() => {
		setTheme(window?.localStorage?.getItem('theme'))
	}, [])

	const close = useCallback(() => setShowFilter(false), [])
	useOutsideClicks(filterBubble, close)
	// Side effects for state data, sort, filters ends here

	// Data slicing starts here
	const sliceData = () => {
		setTimeout(() => {
			let currentData
			if (lastElemRef?.current) {
				currentData = [...fragmentedData, ...allData.slice(lastIndex, lastIndex + ROW_CAP)]
			} else {
				currentData = [...fragmentedData, ...allData.slice(0, ROW_CAP)]
			}
			currentData = Utils.sortData(currentData, sort)
			setLastIndex(lastIndex + ROW_CAP)
			setPageNum(pageNum + 1)
			if (filters.filterField && filters.filterOption) {
				handleFilterApply()
			}
			setFragmentedData(currentData)
			if (pageNum === totalPages - 1) {
				setShowSpinner(false)
			}
		}, 1000)
	}
	// Data slicing ends here

	// View rendering starts here
	const generateHeader = () => {
		return headers.map((_hdr: String, idx: number) => {
			return (
				<div
					key={`${_hdr}-${idx}`}
					className={classNames('data-grid-header-cell', theme && `${theme}-header-cell`)}
					data-key={_hdr}
					data-order={sort.order}
					onClick={handleSort}
				>
					{_hdr} {allData.length > 0 && sort.field === _hdr ? <span>{sort.order === 'asc' ? sortAsc : sortDesc}</span> : null}
				</div>
			)
		})
	}

	const generateCells = () => {
		return fragmentedData.map((_data: any, _idx: number) => {
			return (
				<div
					className={classNames('data-grid-content-row', bordered && `data-grid-content-row-bordered ${theme}-content-row-bordered`)}
					key={`content-row-${_idx}`}
					{...(_idx === lastIndex - 1 && { ref: lastElemRef, id: `cellId-${_idx}` })}
				>
					{headers.map((_hdr: any, _indx: number) => (
						<div className={classNames('data-grid-content-cell', theme && `${theme}-content-cell`)} key={`${_hdr}-${_indx}${_idx}`}>
							{_data[_hdr]}
							{_hdr === 'CLOSE' && _data['OPEN'] && _data['CLOSE'] && _data['OPEN'] > _data['CLOSE'] && <FontAwesomeIcon icon={faCaretDown} className={'loss'} />}
							{_hdr === 'CLOSE' && _data['OPEN'] && _data['CLOSE'] && _data['OPEN'] < _data['CLOSE'] && <FontAwesomeIcon icon={faCaretUp} className={'gain'} />}
						</div>
					))}
				</div>
			)
		})
	}

	const generateEmptyView = () => {
		return (
			<div className={classNames('data-grid-no-data-section', theme && `${theme}-no-data-section`)}>
				<span
					dangerouslySetInnerHTML={{
						__html: STATIC_STRINGS.NO_DATA_MESSAGE
					}}
				></span>
			</div>
		)
	}

	const generateFiltersModal = () => {
		return (
			<div className={'filters-container'} ref={filterBubble}>
				<div className='filters-container-content'>
					<div>
						<select name={'filterField'} onChange={updateFilter} value={filterField}>
							<option value={''}>{STATIC_STRINGS.SELECT_DEFAULT_TEXT}</option>
							{APP_CONSTANTS.NUM_SORT.map((hdr, idx) => {
								return (
									<option value={hdr} key={`opt-${hdr}-${idx}`}>
										{hdr}
									</option>
								)
							})}
						</select>
					</div>
					<div>
						<input type='radio' id='eq' name='filterOption' value='=' onChange={updateFilter} checked={filterOption === '='} />
						<label htmlFor='eq'>{'Equals'}</label>
						<input type='radio' id='gt' name='filterOption' value='>' onChange={updateFilter} checked={filterOption === '>'} />
						<label htmlFor='gt'>{'> than'}</label>
						<input type='radio' id='lt' name='filterOption' value='<' onChange={updateFilter} checked={filterOption === '<'} />
						<label htmlFor='lt'>{'< than'}</label>
					</div>
					<div>
						<input type={'number'} name={'filterValue'} min={0} onChange={updateFilter} value={filterValue} />
					</div>
				</div>
				<div className={'filters-container-footer'}>
					<button onClick={handleFilterReset} className={'tertiary-btn'}>
						{STATIC_STRINGS.CLEAR_BTN_TEXT}
					</button>
					<button onClick={handleFilterApply} className={'primary-btn'}>
						{STATIC_STRINGS.APPLY_BTN_TEXT}
					</button>
				</div>
			</div>
		)
	}
	// View rendering ends here

	// Search section starts here
	const delaySetSearchText = useCallback(
		Utils.debouncer((value: any) => {
			setSearchText(value)
			if (!value) {
				setSearchText('')
			}
			filterSearchTextValues(value)
		}, 500),
		[]
	)

	const onSearchChange = (e: React.ChangeEvent) => {
		let elem: any = e.target || e.currentTarget
		let _value = elem.value
		delaySetSearchText(_value)
		e.stopPropagation()
	}

	const handleSort = (e: React.MouseEvent) => {
		let elem = e.target as HTMLDivElement | HTMLSpanElement | any
		if (elem.tagName !== 'DIV') {
			elem = elem.closest('.data-grid-header-cell')
		}
		let elemDataKey = elem.dataset.key as any
		let elSortOrder = elem.dataset.order as any
		elSortOrder = elSortOrder === 'desc' ? 'asc' : 'desc'
		let sortItems = [...fragmentedData]
		sortItems = Utils.sortData(fragmentedData, { field: elemDataKey, order: elSortOrder })
		setSort({ field: elemDataKey, order: elSortOrder })
		setFragmentedData(sortItems)
	}

	const filterSearchTextValues = (value: string) => {
		let searchResult = allData.filter((elem: any) => {
			if (elem['SYMBOL']?.toLowerCase().indexOf(value) > -1) {
				return elem
			}
		})
		setFragmentedData(searchResult)
		setShowSpinner(false)
	}

	const clearSearchText = (ev: React.MouseEvent) => {
		ev.preventDefault()
		if (!Utils.isEmpty(searchText)) {
			setSearchText('')
			searchElemRef.current.value = ''
			sliceData()
		}
	}
	// Search section ends here

	// Filter section starts here
	const handleFilter = () => {
		setShowFilter(true)
	}

	const updateFilter = (ev: React.ChangeEvent) => {
		let elem = ev.target as HTMLSelectElement | HTMLInputElement
		switch (elem.name) {
			case 'filterField':
				elem.value && setFilterField(elem.value)
				break
			case 'filterOption':
				elem.value && setFilterOption(elem.value)
				break
			case 'filterValue':
				elem.value && setFilterValue(+elem.value)
				break
			default:
				break
		}
	}

	const handleFilterReset = () => {
		setFilterField('')
		setFilterOption('')
		setFilterValue(0)
		setFilters({ filterField: '', filterOption: '', filterValue: 0 })
		setShowFilter(false)
		setShowSpinner(false)
		sliceData()
	}

	const handleFilterApply = () => {
		let res
		let filterResult = allData.filter((elem: any) => {
			switch (filters.filterOption) {
				case '=':
					res = +elem[filters.filterField] === filters.filterValue
					break
				case '>':
					res = +elem[filters.filterField] > filters.filterValue
					break
				case '<':
					res = +elem[filters.filterField] < filters.filterValue
					break
				default:
					break
			}
			return res
		})
		setFragmentedData(filterResult)
		setShowSpinner(false)
		setShowFilter(false)
	}
	// Filter section ends here

	return (
		<>
			<div className={'top-grid-bar'}>
				<div className='search-section'>
					<div className={classNames('search-box', allData.length === 0 && 'disabled')}>
						<span className={'pre-decorator'}>{searchIcon}</span>
						<input type='text' placeholder={STATIC_STRINGS.SEARCH_PLACEHOLDER} onChange={onSearchChange} ref={searchElemRef} disabled={allData.length <= 0} />
						{searchText.length > 0 && (
							<span className={'post-decorator'} onClick={clearSearchText}>
								{searchCloseIcon}
							</span>
						)}
					</div>
				</div>
				<div className={classNames('filter-section', allData.length === 0 && 'disabled')} onClick={handleFilter}>
					<span>{filterIcon}</span>
					{showFilter && generateFiltersModal()}
				</div>
			</div>
			<div className={classNames('data-grid', bordered && 'bordered')}>
				{headers && <div className={classNames('data-grid-header-row', 'data-grid-header-row-fixed', theme && `${theme}-header-row`)}>{generateHeader()}</div>}
				{fragmentedData && fragmentedData.length > 0 ? <>{generateCells()}</> : <React.Fragment key='data-grid-no-data-cells'>{generateEmptyView()}</React.Fragment>}
			</div>
			{showSpinner && (
				<div ref={loader} className={'loading'}>
					<Spinner />
				</div>
			)}
		</>
	)
}

export default DataGrid
