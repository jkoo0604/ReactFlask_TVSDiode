import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { ChevronRightRounded } from '@material-ui/icons';
import clsx from 'clsx';

import colors from '../config/colors';

const useStyles = makeStyles((theme) => ({
    accordion: {

    },
    captionContainer: {
        color: colors.backgroundButton,
        fontSize: 14,
        padding: '0px 5px',
        display: 'flex',
        '&:hover': {
            cursor: 'pointer'
        }
    },
    contentContainer: {
        maxHeight: 0,
        overflow: 'hidden',
        textTransform: 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        transitionDuration: '0.5s',
        transitionProperty: 'max-height',
        position: 'relative',
    },
    content: {
        opacity: 0,
        transform: 'translateY(-1rem)',
        transitionTimingFunction: 'linear, ease',
        transitionDuration: '0.1s',
        transition: 'opacity, transform',
        transitionDelay: '0.5s',
        overflow: 'auto'
    },
    title: {
        marginLeft: 5,
        color: colors.backgroundButton
    },
    icon: {
        width: '1rem',
        height: '1rem',
        transition: 'transform 0.3s ease-in-out',
        fill: colors.backgroundButton
    },
    open: {
        '& $icon': {
            transform: 'rotate(90deg)'
        },
        '& $contentContainer': {
            maxHeight: '10rem',
            transitionDuration: '0.5s',
            tranasitionProperty: 'max-height',
            transitionTimingFunction: 'cubic-bezier(0.895, 0.03, 0.685, 0.22)'
        }, 
        '& $content': {
            opacity: '1',
            transform: 'translateY(0)',
            transitionDelay: '0.2s',
            transitionTimingFunction: 'ease-in-out',
            transitionDuration: '0.2s',
            transitionProperty: 'opacity, transform'
        }, 
        '& $captionContainer': {
            opacity: '1',
            transform: 'translateY(0)',
            transitionDelay: '0.2s',
            transitionTimingFunction: 'ease-in-out',
            transitionDuration: '0.2s',
            transitionProperty: 'opacity, transform'
        }, 
    }   
}));

const MyAccordion = ({children}) => {
    const classes = useStyles();
    const [open, setOpen] = useState(false);

    return(
        <div className={clsx(classes.accordion, {[classes.open]: open})} onClick={() => setOpen(!open)}>
            <div className={classes.captionContainer}>
                <ChevronRightRounded className={classes.icon} />
                {
                    open ? <span className={classes.title}>Hide Category Definition</span> : <span className={classes.title}>Show Category Definition</span>
                }
            </div>
            <div className={classes.contentContainer}>
                <div className={classes.content}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default MyAccordion;