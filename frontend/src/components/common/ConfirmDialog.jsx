import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmText = 'Confirm', confirmColor = 'primary' }) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle className="dark:bg-gray-800 dark:text-white">{title}</DialogTitle>
      <DialogContent className="dark:bg-gray-800">
        <DialogContentText className="dark:text-gray-300">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions className="dark:bg-gray-800">
        <Button onClick={onCancel} color="inherit" className="dark:text-gray-300">
          Cancel
        </Button>
        <Button onClick={onConfirm} color={confirmColor} variant="contained" autoFocus>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
