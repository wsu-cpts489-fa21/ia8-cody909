import { Modal, Button } from "react-bootstrap";
import { useState } from "react";

export default function PopUpModal(props) {
  const [show, setShow] = useState(true);

  const handleClose = () => {
    setShow(false);
    // on close execute the function associated with the last entry in the choices object
    if (props.choices) {
      const lastFunction =
        props.choices[
          Object.keys(props.choices)[Object.keys(props.choices).length - 1]
        ];
      try {
        lastFunction();
      } catch (e) {
        console.log(e);
      }
    }
  };

  const handleClickButton = (value)=>{
    try {
      value();
      setShow(false);
    } catch (e) {
      console.log(e);
      setShow(false);
    }
  }

  return (
    <>
      <Modal data-testid="modal" show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <h5>{props.text || "no text provided"}</h5>
        </Modal.Header>
        <Modal.Body className="ModalFooterDisplay">
          {
            props.choices?
              Object.entries(props.choices).map(([key, value]) => {
                return <Button className="mb-3 modalBtn" data-testid={key} onClick={()=>{handleClickButton(value)}}> {key} </Button>
              })
              :<></>
          }
        </Modal.Body>
      </Modal>
    </>
  );
}
