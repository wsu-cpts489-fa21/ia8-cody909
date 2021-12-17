import React from 'react';
import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import RoundsMode from './RoundsMode';
import RoundsTable from './RoundsTable';
import RoundForm from './RoundForm';
import FloatingButton from './FloatingButton'

/*************************************************************************
 * @function RoundsPage
 * @desc
 * Diplays the rounds page.
 *************************************************************************/
export default function RoundsPage (props) {
    const [mode, setMode] = useState(RoundsMode.ROUNDSTABLE);
    const [deleteId, setDeleteId] = useState(-1)
    const [editId, setEditId] = useState(-1)

    const initiateEditRound = (val) => {
        setEditId(val)
        setMode(RoundsMode.EDITROUND)
        props.toggleModalOpen()
    }

    const initiateDeleteRound = (val) => {
        setDeleteId(val);
        props.deleteRound(val);
    }

    switch (mode) {
        case RoundsMode.ROUNDSTABLE:
            return (
                <>
                    <RoundsTable rounds={props.rounds}
                        deleteRound={props.deleteRound}
                        initiateEditRound={initiateEditRound}
                        menuOpen={props.menuOpen}
                        roundAdded={props.roundAdded} />
                    <FloatingButton
                        icon="calendar"
                        label={"Log Round"}
                        menuOpen={props.menuOpen}
                        action={() => setMode(RoundsMode.LOGROUND)}
                    />                
                </>
            );
        case RoundsMode.LOGROUND:
            return (
                <RoundForm mode={mode}
                    roundData={null}
                    saveRound={props.addRound}
                    setMode={(mode)=> setMode(mode)}
                    toggleModalOpen={props.toggleModalOpen} />
            );
        case RoundsMode.EDITROUND:
            return (
                <RoundForm mode={mode}
                    editId={editId}
                    roundData={props.rounds[editId]}
                    saveRound={props.updateRound}
                    setMode={(mode)=> setMode(mode)}
                    toggleModalOpen={props.toggleModalOpen} />
            );
    }
}