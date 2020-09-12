import React, { useState, useEffect } from 'react';
import { Card, CardActions, CardContent, Typography, Grid, Button, Accordion, AccordionSummary, AccordionDetails, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider, Menu, MenuItem, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { GetApp, ExpandMoreRounded } from '@material-ui/icons';
import { navigate } from '@reach/router';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CSVLink } from "react-csv";

import colors from '../config/colors';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        margin: 'auto',
        backgroundColor: colors.darkBackground,
        minHeight: '100vh',
        alignContent: 'center',
        justifyContent: 'center'
    },
    card: {
        width: '80%',
        alignSelf: 'center',
        backgroundColor: colors.darkBackgroundCard,
        padding: 15
    },
    title: {
        color: colors.darkNeutral100
    },
    subtext: {
        color: colors.darkNeutral60,
    },
    alignRight: {
        justifyContent: 'flex-end',
    },
    alignLeft: {
        justifyContent: 'flex-start',
    },
    alignCenter: {
        justifyContent: 'center',
        textAlign: 'center'
    },
    alignBetween: {
        justifyContent: 'space-between'
    },
    button: {
        color: colors.darkAction
    },
    backButton: {
        color: colors.darkActionDelete
    },
    error: {
        color: colors.darkActionDelete,
        marginBottom: 30
    },
    paper: {
        width: '80%',
        alignContent: 'center',
        backgroundColor: colors.darkBackgroundCard,
    },
    container: {
        maxHeight: 440,
        marginTop: 20
    },
    header: {
        backgroundColor: colors.darkBackground
    },
    cell: {
        color: colors.darkNeutral100,
        borderBottom: 'solid',
        borderBottomWidth: 0.5,
        borderBottomColor: colors.darkNeutral40,
    },
    resultDiv: {

    },
    divider: {
        marginTop: 30,
        marginBottom: 30,
        backgroundColor: colors.darkNeutral60
    }
}));

const Results = props => {
    const classes = useStyles();
    const [error, setError] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [csvData, setCsvData] = useState([]);
    const [pdfData, setPdfData] = useState({});
    const [catPdf, setCatPdf] = useState({});
    const [catCsv, setCatCsv] = useState([]);
    const {queryResult, catDef, colList} = props.location.state;


    useEffect(() => {
        // prepare data for csv conversion
        if (!queryResult.hasOwnProperty('data') || !queryResult['data']['ref_id'].length) {
            setError(true);
            return;
        }
        let data = queryResult['data']['results'];
        let refs = queryResult['data']['ref_id'];
        let columns = ['Reference ID'].concat(data[0]['columns']);
        let rows = [columns];
        for (let i=0; i<refs.length; i++) {
            if (data[i]['data'].length) {
                for (let j=0; j<data[i]['data'].length; j++) {
                    data[i]['data'][j].unshift(refs[i]);
                    rows.push(data[i]['data'][j]);
                }
            }
        }
        setCsvData(rows);

        // prepare data for pdf conversion
        let pdfData = queryResult['output']['results'];
        let pdfPrep = {};
        pdfPrep['head'] = [pdfData[0]['columns']];
        let pdfRows = [];
        let pdfText = [];
        for (let i=0; i<refs.length; i++) {
            pdfRows.push([]);
            if (pdfData[i]['data'].length) {
                for (let j=0; j<pdfData[i]['data'].length; j++) {
                    pdfRows[i].push(pdfData[i]['data'][j]);
                }
            };
            pdfText.push('Result for ' + refs[i]);
        }
        pdfPrep['body'] = pdfRows;
        pdfPrep['text'] = pdfText;
        setPdfData(pdfPrep);

        // prepare data for pdf conversion for category def
        let catPrep = {};
        let catCols = [...colList];
        catCols.shift();
        catPrep['head'] = [catCols];
        let catRows = [];
        for (let j=0; j<catDef.length; j++) {
            let tempRow = [...catDef[j]];
            tempRow.shift();
            catRows.push(tempRow);
        }
        catPrep['body'] = catRows;
        catPrep['text'] = 'Category Definitions';
        console.log(catPrep);
        setCatPdf(catPrep);

        // cat def csv
        catRows = [catCols];
        for (let i=0; i<catDef.length; i++) {
            let tempRow = [...catDef[i]];
            tempRow.shift();
            catRows.push(tempRow);
        }
        setCatCsv(catRows);
    }, []);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    
    const handlePDF = () => {
        handleClose();
        let doc = new jsPDF();
        let finalY = doc.lastAutoTable.finalY || 10;
        let len = queryResult['data']['ref_id'].length;

        for (let i=0; i<len; i++) {
            doc.text(pdfData['text'][i], 14, finalY + 15);
            doc.autoTable({
                startY: finalY + 20,
                head: pdfData['head'],
                body: pdfData['body'][i],
                pageBreak: 'avoid'
            });    
            finalY = doc.lastAutoTable.finalY;        
        }
        // doc.addPage('a4','portrait');
        // doc.text(catPdf['text'], 14, 20);
        // doc.autoTable({
        //     startY: 40,
        //     head: catPdf['head'],
        //     body: catPdf['body'],
        // });
        doc.save('result.pdf');
    };

    const handleBack = () => {
        navigate('/load', {replace: true});
    };

    return (
        <>      
        <Grid container align='center' className={classes.root}>
            <Card className={classes.card}>
                <CardActions className={classes.alignBetween}>
                    <Button size="small" className={classes.backButton} onClick={handleBack}>Reset</Button>
                    <IconButton className={classes.button} onClick={handleClick}><GetApp /></IconButton>
                    <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
                        <MenuItem onClick={handlePDF}>Download result in PDF</MenuItem>
                        <MenuItem><CSVLink data={csvData} filename={"result.csv"} onClick={handleClose}>Download full data in CSV</CSVLink></MenuItem>
                        <MenuItem><CSVLink data={catCsv} filename={"catdef.csv"} onClick={handleClose}>Download category definitions in CSV</CSVLink></MenuItem>
                    </Menu>
                </CardActions>
                <CardContent>
                    <Typography className={classes.title} gutterBottom variant="h4">
                        Result
                    </Typography>
                    <Typography className={classes.error} variant="subtitle2">
                        { error ? 'No result to display' : '' }
                    </Typography>
                    {/* <Paper className={classes.paper} elevation={5}> */}
                        {
                            queryResult['data']['ref_id'].map((ref, idx) => (
                                <div key={ref} className={classes.resultDiv}>
                                    <Typography className={classes.subtext} variant='h6'>{ref}</Typography>
                                    <Accordion>
                                        <AccordionSummary expandIcon={<ExpandMoreRounded />}>
                                            Category {queryResult['data']['cat_id'][idx]}
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <TableContainer className={classes.container}>
                                                <Table stickyHeader>
                                                    <TableHead>
                                                        <TableRow>
                                                            {
                                                                colList.map((col, i) => {
                                                                    if (i>0) {
                                                                        return (
                                                                            <TableCell key={i} align='center' className={`${classes.header} ${classes.cell}`}>
                                                                                {col}
                                                                            </TableCell>
                                                                        )
                                                                    }
                                                                })
                                                            }
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody className={classes.header}>
                                                        <TableRow>
                                                            {
                                                                catDef[queryResult['data']['cat_id'][idx]-1].map((row, i) => {
                                                                    if(i>0) {
                                                                        return (
                                                                        <TableCell key={`col${i}`} align='center' className={classes.cell}>
                                                                            {row}
                                                                        </TableCell>
                                                                        )}
                                                                })
                                                            }
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </AccordionDetails>
                                    </Accordion>
                                    {
                                        queryResult['output']['results'][idx]['data'].length === 0 ? <Typography>No component found</Typography> : 
                                        <TableContainer className={classes.container}>
                                            <Table stickyHeader>
                                                <TableHead>
                                                    <TableRow>
                                                        {
                                                            queryResult['output']['results'][idx]['columns'].map((col, i) => {
                                                                return (
                                                                    <TableCell key={i} align='center' className={`${classes.header} ${classes.cell}`}>
                                                                        {col}
                                                                    </TableCell>
                                                                )
                                                            })
                                                        }
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody className={classes.header}>
                                                    {
                                                        queryResult['output']['results'][idx]['data'].map((row, i) => 
                                                        <TableRow hover key={i}>
                                                            {
                                                                queryResult['output']['results'][idx]['data'][i].map((cell, index) => {
                                                                    return (
                                                                    <TableCell key={`col${index}`} align='center' className={classes.cell}>
                                                                        {cell}
                                                                    </TableCell>
                                                                    )
                                                                })
                                                            }
                                                        </TableRow>)
                                                    }
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    }
                                    <Divider light classes={{root: classes.divider}}/>
                                </div>
                            ))
                        }
                    {/* </Paper> */}
                </CardContent>
                <CardActions className={classes.alignRight}>
                </CardActions>
            </Card>
        </Grid>
        </>
        
    )
}

export default Results;