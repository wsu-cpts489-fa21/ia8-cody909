/*************************************************************************
 * File: RoundsTable.jsx
 * This is a component for displaying a users logged rounds in a table
 * @author Cody Mercadante
 ************************************************************************/

import { React, useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PopUpModal from "./PopUpModal";


/*************************************************************************
 * @function RoundsTable
 * @desc
 * Default exported function that returns renders html for the component.
 * @prop rounds            - an array of the users logged rounds
 * @prop deleteRound       - function that deletes a round from the db and
 *                           local storage
 * @prop initiateEditRound - function that open opens a page with a form
 *                           to edit a round
 *************************************************************************/
export default function RoundsTable(props) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteID, setDeleteID] = useState();
  const [editID, setEditID] = useState();
  const [showConfirmEdit, setShowConfirmEdit] = useState(false);

  /*************************************************************************
   * @function confirmDeleteModal
   * @desc
   * Renders a pop up modal asking the user to confirm the deletion of a
   * round
   *************************************************************************/
  const confirmDeleteModal = () => {
    /*************************************************************************
     * @function confirmDelete
     * @desc
     * When the user clicks on the button to confirm the modal is closed and
     * the round is deleted
     *************************************************************************/
    const confirmDelete = async () => {
      setShowConfirmDelete(false);
      props.deleteRound(deleteID);
    };

    /*************************************************************************
     * @function cancelDelete
     * @desc
     * When the user clicks on the cancel button the modal is closed and the
     * round is not deleted
     *************************************************************************/
    const cancelDelete = () => {
      setShowConfirmDelete(false);
    };

    const text = "Are you sure you want to delete this round?";
    const choices = {
      "Yes, delete round": confirmDelete,
      "No, do not delete round": cancelDelete,
    };
    return <PopUpModal text={text} choices={choices}></PopUpModal>;
  };

  const confirmEditModal = () => {
    /*************************************************************************
     * @function confirmEdit
     * @desc
     * When the user clicks on the button to confirm the modal is closed and
     * start editing the round process
     *************************************************************************/
    const confirmEdit = async () => {
      setShowConfirmEdit(false);
      // props.deleteRound(deleteID);
      props.initiateEditRound(editID);
    };

    /*************************************************************************
     * @function cancelEdit
     * @desc
     * When the user clicks on the cancel button the modal is closed and the
     * cancel the round editing process
     *************************************************************************/
    const cancelEdit = () => {
      setShowConfirmEdit(false);
    };

    const text = "Are you sure you want to edit this round?";
    const choices = {
      Continue: confirmEdit,
      Cancel: cancelEdit,
    };
    return <PopUpModal text={text} choices={choices}></PopUpModal>;
  };

  const deleteBtnClicked = (rowID) => {
    setShowConfirmDelete(true);
    setDeleteID(props.rounds[rowID]._id);
  };

  const editBtnClicked = (rowID) => {
    setShowConfirmEdit(true);
    setEditID(rowID);
  };







  const renderTable = () => {
    const table = [];
    for (let r = 0; r < props.rounds.length; ++r) {
      table.push(
        <tr key={r}>
          <td>{props.rounds[r].date.substring(0, 10)}</td>
          <td>{props.rounds[r].course}</td>
          <td>
            {Number(props.rounds[r].strokes) +
              Number(props.rounds[r].minutes) +
              ":" +
              (props.rounds[r].seconds < 10
                ? "0" + props.rounds[r].seconds
                : props.rounds[r].seconds) +
              " (" +
              props.rounds[r].strokes +
              " in " +
              props.rounds[r].minutes +
              ":" +
              (props.rounds[r].seconds < 10
                ? "0" + props.rounds[r].seconds
                : props.rounds[r].seconds) +
              ")"}
          </td>
          <td>
            <button onClick={props.menuOpen ? null : () => editBtnClicked(r)}>
              <FontAwesomeIcon icon="eye" />
              <FontAwesomeIcon icon="edit" />
            </button>
          </td>
          <td>
            <button onClick={props.menuOpen ? null : () => deleteBtnClicked(r)}>
              <FontAwesomeIcon icon="trash" />
            </button>
          </td>
        </tr>
      );
    }
    return table;
  };

  return (
    <div
      id="roundsModeTab"
      className="mode-page"
      role="tabpanel"
      aria-label="Rounds Tab"
      tabIndex="0"
    >
      <h1 className="mode-page-header">Rounds</h1>
      <table id="roundsTable" className="table table-hover caption-top">
        <caption id="roundsTableCaption" aria-live="polite">
          {"Table displaying " +
            props.rounds.length +
            " speedgolf round" +
            (props.rounds.length !== 1 ? "s" : "")}
        </caption>
        <thead className="table-light">
          <tr>
            <th
              scope="col"
              role="columnheader"
              className="sortable-header cell-align-middle"
              aria-sort="none"
            >
              <button
                className="btn bg-transparent table-sort-btn"
                aria-label="Sort ascending by date"
              >
                <FontAwesomeIcon icon="sort" />
              </button>
              Date
            </th>
            <th
              scope="col"
              role="columnheader"
              className="sortable-header cell-align-middle"
              aria-sort="none"
            >
              <button
                className="btn bg-transparent table-sort-btn"
                aria-label="Sort ascending by course"
              >
                <FontAwesomeIcon icon="sort" />
              </button>
              Course
            </th>
            <th
              scope="col"
              role="columnheader"
              className="sortable-header cell-align-middle"
              aria-sort="none"
            >
              <button
                className="btn bg-transparent table-sort-btn"
                aria-label="Sort ascending by score"
              >
                <FontAwesomeIcon icon="sort" />
              </button>
              Score
            </th>
            <th scope="col" className="cell-align-middle">
              View/Edit...
            </th>
            <th scope="col" className="cell-align-middle">
              Delete
            </th>
          </tr>
        </thead>
        <tbody>
          {props.rounds === null || props.rounds.length === 0 ? (
            <tr>
              <td colSpan="5" scope="rowgroup">
                <i>No rounds logged</i>
              </td>
            </tr>
          ) : (
            renderTable()
          )}
        </tbody>
      </table>
      {showConfirmDelete ? confirmDeleteModal() : null}
      {showConfirmEdit ? confirmEditModal() : null}
    </div>
  );
}
