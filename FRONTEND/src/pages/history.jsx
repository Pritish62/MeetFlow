import React, { useContext, useEffect, useState } from "react";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";

export default function History() {
  const { getToHistoryOfUser } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const routeTo = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getToHistoryOfUser();
        setMeetings(Array.isArray(history) ? history : []);
      } catch (error) {
        setErrorMessage("Could not load meeting history.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [getToHistoryOfUser]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", px: 2, py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        Call History
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Rejoin recent meetings with one click.
      </Typography>

      {isLoading && <Typography>Loading history...</Typography>}
      {!isLoading && errorMessage && <Typography color="error">{errorMessage}</Typography>}

      {!isLoading && !errorMessage && meetings.length === 0 && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6">No previous calls found</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Your joined or created meetings will appear here.
            </Typography>
          </CardContent>
        </Card>
      )}

      {!isLoading && !errorMessage && meetings.length > 0 && (
        <Stack spacing={2}>
          {meetings.map((meeting) => (
            <Card key={meeting._id} variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Meeting Code: {meeting.meetingCode}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                  Date: {formatDate(meeting.createdAt)}
                </Typography>

                <Button
                  sx={{ mt: 2 }}
                  variant="contained"
                  onClick={() => routeTo(`/${meeting.meetingCode}`)}>
                  Join Again
                </Button>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
