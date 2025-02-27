import { useEffect, useRef, useState } from 'react'
import { useWindowSize } from 'react-use'
import { Stack, Typography, useTheme } from '@mui/material'
import { LoadingBase, makeStyles, useStylesExtends } from '@masknet/theme'
import { useI18N } from '../../../../utils/index.js'
import type { Coin, Currency, Stat } from '../../types/index.js'
import { useDimension, Dimension } from '../../../hooks/useDimension.js'
import { usePriceLineChart } from '../../../hooks/usePriceLineChart.js'
import { openWindow } from '@masknet/shared-base-ui'

const DEFAULT_DIMENSION: Dimension = {
    top: 32,
    right: 16,
    bottom: 32,
    left: 16,
    width: 566,
    height: 200,
}

const useStyles = makeStyles<PriceChartProps>()((theme, { stats, coin }) => {
    return {
        root: {
            position: 'relative',
            cursor: stats.length && coin?.platform_url ? 'pointer' : 'default',
        },
        svg: {
            display: 'block',
        },
        progress: {
            position: 'absolute',
            right: 0,
            bottom: -64,
        },
        placeholder: {
            paddingTop: theme.spacing(10),
            paddingBottom: theme.spacing(10),
            borderStyle: 'none',
        },
    }
})

export interface PriceChartProps extends withClasses<'root'> {
    coin?: Coin
    currency: Currency
    stats: Stat[]
    loading?: boolean
    width?: number
    height?: number
    amount: number
    retry(): void
    children?: React.ReactNode
}

export function PriceChart(props: PriceChartProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(props), props)
    const colors = useTheme().palette.maskColor
    const rootRef = useRef<HTMLDivElement>(null)
    const svgRef = useRef<SVGSVGElement>(null)

    // #region make chart responsive
    const { width } = useWindowSize()
    const [responsiveWidth, setResponsiveWidth] = useState(DEFAULT_DIMENSION.width)
    const [responsiveHeight, setResponsiveHeight] = useState(DEFAULT_DIMENSION.height)

    useEffect(() => {
        if (!rootRef.current) return
        setResponsiveWidth(rootRef.current.getBoundingClientRect().width || DEFAULT_DIMENSION.width)
        setResponsiveHeight(rootRef.current.getBoundingClientRect().height || DEFAULT_DIMENSION.height)
    }, [width /* redraw canvas if window width resize */])
    // #endregion

    const dimension = {
        ...DEFAULT_DIMENSION,
        width: responsiveWidth,
        height: responsiveHeight,
    }

    useDimension(svgRef, dimension)
    usePriceLineChart(
        svgRef,
        props.stats.map(([date, price]) => ({
            date: new Date(date),
            value: price,
        })),
        dimension,
        'x-trader-price-line-chart',
        { sign: props.currency.name ?? 'USD', color: props.amount > 0 ? colors.success : colors.danger },
    )

    return (
        <div className={classes.root} ref={rootRef}>
            {props.loading && <LoadingBase className={classes.progress} color="primary" size={15} />}
            {props.stats.length ? (
                <Stack gap={2}>
                    <svg
                        className={classes.svg}
                        ref={svgRef}
                        width={dimension.width}
                        height={dimension.height}
                        viewBox={`0 0 ${dimension.width} ${dimension.height}`}
                        preserveAspectRatio="xMidYMid meet"
                        onClick={() => {
                            props.stats.length && openWindow(props.coin?.platform_url)
                        }}
                    />
                    {props.children}
                </Stack>
            ) : (
                <Typography className={classes.placeholder} align="center" color="textSecondary">
                    {t('plugin_trader_no_data')}
                </Typography>
            )}
        </div>
    )
}
