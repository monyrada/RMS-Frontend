export default function UseToggleModal(setToggle, setSelectedItem,setTitleForm) {
  const handleOpen = () => {
    if (setSelectedItem) {
      setSelectedItem(null);
    }
    setToggle(true);
  };

  const handleClose = () => {
    setToggle(false);
    setSelectedItem(null);
  };
  const handleCreateTitle =()=>{
    setTitleForm = "create";
  }
  const handleEditTitle = ()=>{
    setTitleForm = "edit";
  }
  return {
    handleOpen,
    handleClose,
    handleCreateTitle,
    handleEditTitle
  };
}