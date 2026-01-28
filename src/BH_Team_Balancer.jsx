import React, { useState, useMemo } from 'react';
import { Users, Shirt, Star, AlertCircle, Shuffle, Edit2, Check, X, Upload, Download, FileSpreadsheet, FileText } from 'lucide-react';

const HockeyTeamBalancerWithUpload = () => {
  const [teamNames, setTeamNames] = useState({ team1: 'Teal Tanglers', team2: 'Orange Crush' });
  const [editingTeam, setEditingTeam] = useState(null);
  const [tempTeamName, setTempTeamName] = useState('');
  const [uploadError, setUploadError] = useState('');

  const sizes = ['M', 'L', 'XL', '2XL', 'G2XL'];
  const skaterSizes = ['M', 'L', 'XL', '2XL'];
  
  const [inventory, setInventory] = useState({
    team1: { M: 2, L: 6, XL: 5, '2XL': 4, 'G2XL': 2 },
    team2: { M: 2, L: 6, XL: 5, '2XL': 4, 'G2XL': 2 }
  });

  const [players, setPlayers] = useState([
    { id: 1, name: '', rating: 5, preferredSize: 'M', isGoalie: false, isIR: false, isWoman: false, team: null }
  ]);

  const [friendGroups, setFriendGroups] = useState([]);
  const [newGroup, setNewGroup] = useState([]);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadError('');
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        
        if (lines.length < 2) {
          setUploadError('File must contain header row and at least one player');
          return;
        }

        // Parse header
        const header = lines[0].split(',').map(h => h.trim().toLowerCase());
        const nameIdx = header.findIndex(h => h.includes('name'));
        const ratingIdx = header.findIndex(h => h.includes('rating'));
        const sizeIdx = header.findIndex(h => h.includes('size') || h.includes('jersey'));
        const goalieIdx = header.findIndex(h => h.includes('goalie'));
        const irIdx = header.findIndex(h => h.includes('ir') || h.includes('injured'));
        const friendIdx = header.findIndex(h => h.includes('friend') || h.includes('group'));
        const womanIdx = header.findIndex(h => h.includes('woman') || h.includes('female') || h.includes('gender'));

        if (nameIdx === -1 || ratingIdx === -1 || sizeIdx === -1) {
          setUploadError('CSV must have columns: Name, Rating, Preferred Size (and optionally Goalie, IR, Woman, Friend Group)');
          return;
        }

        // Parse players
        const newPlayers = [];
        const groupMap = new Map();

        lines.slice(1).forEach((line, idx) => {
          const cols = line.split(',').map(c => c.trim());
          
          const name = cols[nameIdx] || `Player ${idx + 1}`;
          const rating = parseInt(cols[ratingIdx]) || 5;
          const preferredSize = cols[sizeIdx]?.toUpperCase() || 'L';
          const isGoalie = goalieIdx !== -1 && (cols[goalieIdx]?.toLowerCase() === 'yes' || cols[goalieIdx]?.toLowerCase() === 'true' || cols[goalieIdx] === '1');
          const isIR = irIdx !== -1 && (cols[irIdx]?.toLowerCase() === 'yes' || cols[irIdx]?.toLowerCase() === 'true' || cols[irIdx] === '1');
          const isWoman = womanIdx !== -1 && (cols[womanIdx]?.toLowerCase() === 'yes' || cols[womanIdx]?.toLowerCase() === 'true' || cols[womanIdx] === '1' || cols[womanIdx]?.toLowerCase() === 'female' || cols[womanIdx]?.toLowerCase() === 'f' || cols[womanIdx]?.toLowerCase() === 'woman');
          const friendGroup = friendIdx !== -1 ? cols[friendIdx]?.trim() : '';

          const validSize = sizes.includes(preferredSize) ? preferredSize : 'L';

          const playerId = idx + 1;
          newPlayers.push({
            id: playerId,
            name,
            rating: Math.max(1, Math.min(10, rating)),
            preferredSize: validSize,
            isGoalie,
            isIR,
            isWoman,
            team: null
          });

          if (friendGroup) {
            if (!groupMap.has(friendGroup)) {
              groupMap.set(friendGroup, []);
            }
            groupMap.get(friendGroup).push(playerId);
          }
        });

        const newFriendGroups = Array.from(groupMap.values()).filter(group => group.length >= 2);

        setPlayers(newPlayers);
        setFriendGroups(newFriendGroups);
        setUploadError('');
        
        const goalieCount = newPlayers.filter(p => p.isGoalie).length;
        alert(`Successfully loaded ${newPlayers.length} players (${goalieCount} goalies) and ${newFriendGroups.length} friend groups!`);
      } catch (error) {
        setUploadError(`Error parsing file: ${error.message}`);
      }
    };

    reader.onerror = () => {
      setUploadError('Error reading file');
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  // Download template CSV
  const downloadTemplate = () => {
    const template = `Name,Rating,Preferred Size,Goalie,IR,Woman,Friend Group
John Smith,7,L,No,No,No,A
Jane Doe,8,M,No,No,Yes,A
Bob Wilson,6,XL,Yes,No,No,
Sarah Lee,9,2XL,No,No,Yes,B
Mike Jones,7,L,No,No,No,B
Tom Brown,5,M,No,Yes,No,
Lisa White,8,L,Yes,No,Yes,`;

    const base64 = btoa(unescape(encodeURIComponent(template)));
    const dataUrl = `data:text/csv;base64,${base64}`;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'hockey_roster_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Download for Excel
  const downloadForExcel = () => {
    const team1Players = players.filter(p => p.team === 'team1');
    const team2Players = players.filter(p => p.team === 'team2');
    
    const team1Stats = stats.team1;
    const team2Stats = stats.team2;

    let content = `HOCKEY ROSTER DATA - FOR EXCEL CREATION
Generated: ${new Date().toLocaleDateString()}

INSTRUCTIONS: Upload this file to Claude and say "Create an Excel spreadsheet from this hockey roster data"

================================================================================
TEAM NAMES
================================================================================
Team 1: ${teamNames.team1}
Team 2: ${teamNames.team2}

================================================================================
TEAM 1: ${teamNames.team1.toUpperCase()}
================================================================================
Name,Rating,Preferred Size,Assigned Size,Position,IR Status,Friend Group
`;

    team1Players.forEach(player => {
      const name = player.name || 'Unknown';
      const rating = player.rating || 0;
      const prefSize = player.preferredSize || '';
      const assigned = player.assignedSize || 'TBD';
      const position = player.isGoalie ? 'Goalie' : 'Skater';
      const ir = player.isIR ? 'IR' : 'Active';
      const groupIndex = friendGroups.findIndex(group => group.includes(player.id));
      const friendGroup = groupIndex >= 0 ? `Group ${groupIndex + 1}` : '';
      content += `${name},${rating},${prefSize},${assigned},${position},${ir},${friendGroup}\n`;
    });

    content += `
================================================================================
TEAM 2: ${teamNames.team2.toUpperCase()}
================================================================================
Name,Rating,Preferred Size,Assigned Size,Position,IR Status,Friend Group
`;

    team2Players.forEach(player => {
      const name = player.name || 'Unknown';
      const rating = player.rating || 0;
      const prefSize = player.preferredSize || '';
      const assigned = player.assignedSize || 'TBD';
      const position = player.isGoalie ? 'Goalie' : 'Skater';
      const ir = player.isIR ? 'IR' : 'Active';
      const groupIndex = friendGroups.findIndex(group => group.includes(player.id));
      const friendGroup = groupIndex >= 0 ? `Group ${groupIndex + 1}` : '';
      content += `${name},${rating},${prefSize},${assigned},${position},${ir},${friendGroup}\n`;
    });

    content += `
================================================================================
SUMMARY STATISTICS
================================================================================

${teamNames.team1}:
- Total Players: ${team1Stats.count}
- Total Rating: ${team1Stats.rating}
- Average Rating: ${team1Stats.count > 0 ? (team1Stats.rating / team1Stats.count).toFixed(2) : 0}
- Goalies: ${team1Stats.goalies}
- Women: ${team1Stats.women}
- IR: ${team1Stats.ir}

${teamNames.team2}:
- Total Players: ${team2Stats.count}
- Total Rating: ${team2Stats.rating}
- Average Rating: ${team2Stats.count > 0 ? (team2Stats.rating / team2Stats.count).toFixed(2) : 0}
- Goalies: ${team2Stats.goalies}
- Women: ${team2Stats.women}
- IR: ${team2Stats.ir}

Rating Difference: ${Math.abs(team1Stats.rating - team2Stats.rating).toFixed(1)}

================================================================================
JERSEY ALLOCATION SUMMARY
================================================================================

Jersey Statistics:
- Preferred Size Met: ${stats.jerseys.preferredSizeMet}
- Sized Up: ${stats.jerseys.sizedUp}
- Unmet Needs (TBD): ${stats.jerseys.unmetNeeds}

${teamNames.team1} Jersey Distribution:
- M: ${team1Players.filter(p => p.assignedSize === 'M').length}
- L: ${team1Players.filter(p => p.assignedSize === 'L').length}
- XL: ${team1Players.filter(p => p.assignedSize === 'XL').length}
- 2XL: ${team1Players.filter(p => p.assignedSize === '2XL').length}
- G2XL: ${team1Players.filter(p => p.assignedSize === 'G2XL').length}
- TBD: ${team1Players.filter(p => !p.assignedSize || p.assignedSize === 'TBD').length}

${teamNames.team2} Jersey Distribution:
- M: ${team2Players.filter(p => p.assignedSize === 'M').length}
- L: ${team2Players.filter(p => p.assignedSize === 'L').length}
- XL: ${team2Players.filter(p => p.assignedSize === 'XL').length}
- 2XL: ${team2Players.filter(p => p.assignedSize === '2XL').length}
- G2XL: ${team2Players.filter(p => p.assignedSize === 'G2XL').length}
- TBD: ${team2Players.filter(p => !p.assignedSize || p.assignedSize === 'TBD').length}
`;

    const base64 = btoa(unescape(encodeURIComponent(content)));
    const dataUrl = `data:text/plain;base64,${base64}`;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'hockey_roster_for_excel.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Download admin roster data - for detailed PDF creation
  const downloadAdminRoster = () => {
    const team1Players = players.filter(p => p.team === 'team1');
    const team2Players = players.filter(p => p.team === 'team2');
    
    const team1Stats = stats.team1;
    const team2Stats = stats.team2;

    let content = `HOCKEY ROSTER DATA - FOR ADMIN PDF CREATION
Generated: ${new Date().toLocaleDateString()}

INSTRUCTIONS: Upload this file to Claude and say "Create an admin PDF roster from this data"

================================================================================
TEAM NAMES
================================================================================
Team 1: ${teamNames.team1}
Team 2: ${teamNames.team2}

================================================================================
TEAM 1: ${teamNames.team1.toUpperCase()}
================================================================================
`;

    team1Players.forEach(player => {
      const groupIndex = friendGroups.findIndex(group => group.includes(player.id));
      const friendGroup = groupIndex >= 0 ? `Friend Group ${groupIndex + 1}` : 'No Group';
      content += `
# | ${player.name || 'Unknown'} | Rating: ${player.rating}
  Position: ${player.isGoalie ? 'Goalie' : 'Skater'}
  Jersey: ${player.preferredSize} → ${player.assignedSize || 'TBD'}
  Status: ${player.isIR ? 'IR' : 'Active'}${player.isWoman ? ' | Woman' : ''}
  ${friendGroup}
`;
    });

    content += `
================================================================================
TEAM 1 SUMMARY
================================================================================
Total Players: ${team1Stats.count}
Total Rating: ${team1Stats.rating}
Average Rating: ${team1Stats.count > 0 ? (team1Stats.rating / team1Stats.count).toFixed(2) : 0}
Goalies: ${team1Stats.goalies}
Women: ${team1Stats.women}
IR: ${team1Stats.ir}

================================================================================
TEAM 2: ${teamNames.team2.toUpperCase()}
================================================================================
`;

    team2Players.forEach(player => {
      const groupIndex = friendGroups.findIndex(group => group.includes(player.id));
      const friendGroup = groupIndex >= 0 ? `Friend Group ${groupIndex + 1}` : 'No Group';
      content += `
# | ${player.name || 'Unknown'} | Rating: ${player.rating}
  Position: ${player.isGoalie ? 'Goalie' : 'Skater'}
  Jersey: ${player.preferredSize} → ${player.assignedSize || 'TBD'}
  Status: ${player.isIR ? 'IR' : 'Active'}${player.isWoman ? ' | Woman' : ''}
  ${friendGroup}
`;
    });

    content += `
================================================================================
TEAM 2 SUMMARY
================================================================================
Total Players: ${team2Stats.count}
Total Rating: ${team2Stats.rating}
Average Rating: ${team2Stats.count > 0 ? (team2Stats.rating / team2Stats.count).toFixed(2) : 0}
Goalies: ${team2Stats.goalies}
Women: ${team2Stats.women}
IR: ${team2Stats.ir}

Rating Difference: ${Math.abs(team1Stats.rating - team2Stats.rating).toFixed(1)}

================================================================================
JERSEY ALLOCATION
================================================================================

${teamNames.team1} Jerseys:
- M: ${team1Players.filter(p => p.assignedSize === 'M').length}
- L: ${team1Players.filter(p => p.assignedSize === 'L').length}
- XL: ${team1Players.filter(p => p.assignedSize === 'XL').length}
- 2XL: ${team1Players.filter(p => p.assignedSize === '2XL').length}
- G2XL: ${team1Players.filter(p => p.assignedSize === 'G2XL').length}

${teamNames.team2} Jerseys:
- M: ${team2Players.filter(p => p.assignedSize === 'M').length}
- L: ${team2Players.filter(p => p.assignedSize === 'L').length}
- XL: ${team2Players.filter(p => p.assignedSize === 'XL').length}
- 2XL: ${team2Players.filter(p => p.assignedSize === '2XL').length}
- G2XL: ${team2Players.filter(p => p.assignedSize === 'G2XL').length}

Jersey Status:
- Preferred Size Met: ${stats.jerseys.preferredSizeMet}
- Sized Up: ${stats.jerseys.sizedUp}
- Unmet Needs: ${stats.jerseys.unmetNeeds}
`;

    const base64 = btoa(unescape(encodeURIComponent(content)));
    const dataUrl = `data:text/plain;base64,${base64}`;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'hockey_admin_roster.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Download public roster data - for public PDF creation
  const downloadPublicRoster = () => {
    const team1Players = players.filter(p => p.team === 'team1');
    const team2Players = players.filter(p => p.team === 'team2');

    let content = `HOCKEY ROSTER DATA - FOR PUBLIC PDF CREATION
Generated: ${new Date().toLocaleDateString()}

INSTRUCTIONS: Upload this file to Claude and say "Create a public PDF roster from this data"

================================================================================
TEAM NAMES
================================================================================
Team 1: ${teamNames.team1}
Team 2: ${teamNames.team2}

================================================================================
TEAM 1: ${teamNames.team1.toUpperCase()}
================================================================================
`;

    team1Players.forEach(player => {
      content += `# | ${player.name || 'Unknown'} - ${player.isGoalie ? 'Goalie' : 'Skater'}${player.isIR ? ' (IR)' : ''}\n`;
    });

    content += `
Total Players: ${team1Players.length}
Goalies: ${team1Players.filter(p => p.isGoalie).length}

================================================================================
TEAM 2: ${teamNames.team2.toUpperCase()}
================================================================================
`;

    team2Players.forEach(player => {
      content += `# | ${player.name || 'Unknown'} - ${player.isGoalie ? 'Goalie' : 'Skater'}${player.isIR ? ' (IR)' : ''}\n`;
    });

    content += `
Total Players: ${team2Players.length}
Goalies: ${team2Players.filter(p => p.isGoalie).length}
`;

    const base64 = btoa(unescape(encodeURIComponent(content)));
    const dataUrl = `data:text/plain;base64,${base64}`;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'hockey_public_roster.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const addPlayer = () => {
    const newId = Math.max(...players.map(p => p.id), 0) + 1;
    setPlayers([...players, { 
      id: newId, 
      name: '', 
      rating: 5, 
      preferredSize: 'M', 
      isGoalie: false,
      isIR: false,
      isWoman: false,
      team: null 
    }]);
  };

  const updatePlayer = (id, field, value) => {
    setPlayers(players.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const removePlayer = (id) => {
    setPlayers(players.filter(p => p.id !== id));
    setFriendGroups(friendGroups.map(group => 
      group.filter(playerId => playerId !== id)
    ).filter(group => group.length >= 2));
  };

  const updateInventory = (team, size, value) => {
    setInventory({
      ...inventory,
      [team]: {
        ...inventory[team],
        [size]: Math.max(0, parseInt(value) || 0)
      }
    });
  };

  const startEditTeamName = (team) => {
    setEditingTeam(team);
    setTempTeamName(teamNames[team]);
  };

  const saveTeamName = () => {
    if (tempTeamName.trim()) {
      setTeamNames({ ...teamNames, [editingTeam]: tempTeamName.trim() });
    }
    setEditingTeam(null);
    setTempTeamName('');
  };

  const cancelEditTeamName = () => {
    setEditingTeam(null);
    setTempTeamName('');
  };

  const addToNewGroup = (playerId) => {
    if (newGroup.includes(playerId)) {
      setNewGroup(newGroup.filter(id => id !== playerId));
    } else {
      setNewGroup([...newGroup, playerId]);
    }
  };

  const createFriendGroup = () => {
    if (newGroup.length >= 2) {
      setFriendGroups([...friendGroups, [...newGroup]]);
      setNewGroup([]);
    }
  };

  const removeFriendGroup = (index) => {
    setFriendGroups(friendGroups.filter((_, i) => i !== index));
  };

  const balanceTeams = () => {
    const unassignedPlayers = [...players.filter(p => !p.team)];
    const newPlayerAssignments = {};
    
    players.forEach(p => {
      if (p.team) {
        newPlayerAssignments[p.id] = p.team;
      }
    });

    // PRIORITY 1: Handle friend groups FIRST - they can NEVER be separated
    const unassignedPlayerIds = new Set(unassignedPlayers.map(p => p.id));
    const groupsToAssign = [];
    
    friendGroups.forEach(group => {
      const allUnassigned = group.every(id => unassignedPlayerIds.has(id));
      if (allUnassigned) {
        const groupPlayers = group.map(id => players.find(p => p.id === id));
        const groupRating = groupPlayers.reduce((sum, p) => sum + p.rating, 0);
        const groupWomen = groupPlayers.filter(p => p.isWoman).length;
        const groupGoalies = groupPlayers.filter(p => p.isGoalie).length;
        groupsToAssign.push({
          playerIds: group,
          players: groupPlayers,
          rating: groupRating,
          women: groupWomen,
          goalies: groupGoalies
        });
      }
    });

    // Sort groups by rating (highest first) for better balance
    groupsToAssign.sort((a, b) => b.rating - a.rating);

    // Assign friend groups to teams
    groupsToAssign.forEach(group => {
      const team1Rating = Object.entries(newPlayerAssignments)
        .filter(([_, team]) => team === 'team1')
        .reduce((sum, [id, _]) => sum + players.find(p => p.id === parseInt(id)).rating, 0);
      
      const team2Rating = Object.entries(newPlayerAssignments)
        .filter(([_, team]) => team === 'team2')
        .reduce((sum, [id, _]) => sum + players.find(p => p.id === parseInt(id)).rating, 0);

      const team1Women = Object.entries(newPlayerAssignments)
        .filter(([_, team]) => team === 'team1')
        .reduce((sum, [id, _]) => sum + (players.find(p => p.id === parseInt(id)).isWoman ? 1 : 0), 0);
      
      const team2Women = Object.entries(newPlayerAssignments)
        .filter(([_, team]) => team === 'team2')
        .reduce((sum, [id, _]) => sum + (players.find(p => p.id === parseInt(id)).isWoman ? 1 : 0), 0);

      // Prioritize balancing women, then rating
      let assignToTeam;
      if (team1Women < team2Women) {
        assignToTeam = 'team1';
      } else if (team2Women < team1Women) {
        assignToTeam = 'team2';
      } else {
        // Women are equal, use rating
        assignToTeam = team1Rating <= team2Rating ? 'team1' : 'team2';
      }

      group.playerIds.forEach(id => {
        newPlayerAssignments[id] = assignToTeam;
        unassignedPlayerIds.delete(id);
      });
    });

    // Get remaining unassigned players (not in friend groups)
    const remainingPlayers = unassignedPlayers.filter(p => unassignedPlayerIds.has(p.id));

    // Separate by goalie status
    const remainingGoalies = remainingPlayers.filter(p => p.isGoalie);
    const remainingSkaters = remainingPlayers.filter(p => !p.isGoalie);

    // Assign goalies (alternating by rating)
    remainingGoalies.sort((a, b) => b.rating - a.rating);
    remainingGoalies.forEach((goalie, index) => {
      newPlayerAssignments[goalie.id] = index % 2 === 0 ? 'team1' : 'team2';
      unassignedPlayerIds.delete(goalie.id);
    });

    // Separate remaining skaters by gender
    const remainingWomen = remainingSkaters.filter(p => p.isWoman);
    const remainingMen = remainingSkaters.filter(p => !p.isWoman);

    // Assign women (alternating by rating)
    remainingWomen.sort((a, b) => b.rating - a.rating);
    remainingWomen.forEach((woman, index) => {
      newPlayerAssignments[woman.id] = index % 2 === 0 ? 'team1' : 'team2';
      unassignedPlayerIds.delete(woman.id);
    });

    // Assign remaining men by rating balance
    remainingMen.sort((a, b) => b.rating - a.rating);
    remainingMen.forEach(player => {
      const team1Rating = Object.entries(newPlayerAssignments)
        .filter(([_, team]) => team === 'team1')
        .reduce((sum, [id, _]) => sum + players.find(p => p.id === parseInt(id)).rating, 0);
      
      const team2Rating = Object.entries(newPlayerAssignments)
        .filter(([_, team]) => team === 'team2')
        .reduce((sum, [id, _]) => sum + players.find(p => p.id === parseInt(id)).rating, 0);

      newPlayerAssignments[player.id] = team1Rating <= team2Rating ? 'team1' : 'team2';
    });

    // NEW IMPROVED JERSEY ALLOCATION
    const team1Inv = { ...inventory.team1 };
    const team2Inv = { ...inventory.team2 };

    const assignJerseys = (teamPlayers, teamInventory) => {
      // Separate goalies and skaters
      const goalies = teamPlayers.filter(p => p.isGoalie);
      const skaters = teamPlayers.filter(p => !p.isGoalie);
      
      // Further separate by IR status within each group
      const nonIRGoalies = goalies.filter(p => !p.isIR);
      const irGoalies = goalies.filter(p => p.isIR);
      const nonIRSkaters = skaters.filter(p => !p.isIR);
      const irSkaters = skaters.filter(p => p.isIR);
      
      // Process order: non-IR goalies, non-IR skaters (by size), IR goalies, IR skaters (by size)
      
      // 1. Assign jerseys to non-IR goalies first
      nonIRGoalies.forEach(player => {
        if (teamInventory['G2XL'] > 0) {
          player.assignedSize = 'G2XL';
          teamInventory['G2XL']--;
        } else {
          player.assignedSize = 'TBD';
        }
      });
      
      // 2. Assign jerseys to non-IR skaters (sorted by preferred size: M first, then L, XL, 2XL)
      const sortedNonIRSkaters = [...nonIRSkaters].sort((a, b) => {
        return skaterSizes.indexOf(a.preferredSize) - skaterSizes.indexOf(b.preferredSize);
      });
      
      sortedNonIRSkaters.forEach(player => {
        const sizeIndex = skaterSizes.indexOf(player.preferredSize);
        let assigned = false;
        
        // Try all sizes from preferred upward (M->L->XL->2XL)
        for (let i = sizeIndex; i < skaterSizes.length; i++) {
          if (teamInventory[skaterSizes[i]] > 0) {
            player.assignedSize = skaterSizes[i];
            teamInventory[skaterSizes[i]]--;
            assigned = true;
            break;
          }
        }
        
        if (!assigned) {
          player.assignedSize = 'TBD';
        }
      });
      
      // 3. Assign jerseys to IR goalies
      irGoalies.forEach(player => {
        if (teamInventory['G2XL'] > 0) {
          player.assignedSize = 'G2XL';
          teamInventory['G2XL']--;
        } else {
          player.assignedSize = 'TBD';
        }
      });
      
      // 4. Assign jerseys to IR skaters (sorted by preferred size)
      const sortedIRSkaters = [...irSkaters].sort((a, b) => {
        return skaterSizes.indexOf(a.preferredSize) - skaterSizes.indexOf(b.preferredSize);
      });
      
      sortedIRSkaters.forEach(player => {
        const sizeIndex = skaterSizes.indexOf(player.preferredSize);
        let assigned = false;
        
        // Try all sizes from preferred upward
        for (let i = sizeIndex; i < skaterSizes.length; i++) {
          if (teamInventory[skaterSizes[i]] > 0) {
            player.assignedSize = skaterSizes[i];
            teamInventory[skaterSizes[i]]--;
            assigned = true;
            break;
          }
        }
        
        if (!assigned) {
          player.assignedSize = 'TBD';
        }
      });
    };

    const team1Players = players.filter(p => newPlayerAssignments[p.id] === 'team1');
    const team2Players = players.filter(p => newPlayerAssignments[p.id] === 'team2');
    
    assignJerseys(team1Players, team1Inv);
    assignJerseys(team2Players, team2Inv);

    // Update all players with team assignments AND jersey assignments
    setPlayers(players.map(p => {
      const assignedTeam = newPlayerAssignments[p.id] || null;
      const teamPlayer = assignedTeam === 'team1' 
        ? team1Players.find(tp => tp.id === p.id)
        : assignedTeam === 'team2'
        ? team2Players.find(tp => tp.id === p.id)
        : null;
      
      return {
        ...p,
        team: assignedTeam,
        assignedSize: teamPlayer ? teamPlayer.assignedSize : undefined
      };
    }));
  };

  const clearTeams = () => {
    setPlayers(players.map(p => ({ ...p, team: null, assignedSize: undefined })));
  };

  const stats = useMemo(() => {
    const team1Players = players.filter(p => p.team === 'team1');
    const team2Players = players.filter(p => p.team === 'team2');

    const calculateTeamStats = (teamPlayers) => ({
      count: teamPlayers.length,
      rating: teamPlayers.reduce((sum, p) => sum + p.rating, 0),
      goalies: teamPlayers.filter(p => p.isGoalie).length,
      ir: teamPlayers.filter(p => p.isIR).length,
      women: teamPlayers.filter(p => p.isWoman).length
    });

    // Calculate jersey stats based on SAVED assignedSize
    let preferredSizeMet = 0;
    let sizedUp = 0;
    let unmetNeeds = 0;

    [...team1Players, ...team2Players].forEach(player => {
      if (player.assignedSize === player.preferredSize) {
        preferredSizeMet++;
      } else if (player.assignedSize && player.assignedSize !== 'TBD') {
        sizedUp++;
      } else if (player.assignedSize === 'TBD' || !player.assignedSize) {
        unmetNeeds++;
      }
    });

    return {
      team1: calculateTeamStats(team1Players),
      team2: calculateTeamStats(team2Players),
      jerseys: { preferredSizeMet, sizedUp, unmetNeeds }
    };
  }, [players]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">🏒 BH Team Balancer</h1>
          <p className="text-slate-600">Balance teams by skill, manage jerseys, and respect friend groups</p>
        </div>

        {/* File Upload Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Start: Upload CSV</h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <label className="flex-1 cursor-pointer">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-blue-500 transition text-center">
                  <Upload className="mx-auto mb-2 text-slate-400" size={32} />
                  <p className="text-sm font-medium text-slate-700">Click to upload CSV file</p>
                  <p className="text-xs text-slate-500 mt-1">Or drag and drop here</p>
                </div>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <div className="flex flex-col gap-2 md:w-48">
                <button
                  onClick={downloadTemplate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Template
                </button>
                <p className="text-xs text-slate-500 text-center">Download sample CSV</p>
              </div>
            </div>
            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded flex items-start gap-2">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-red-800">{uploadError}</p>
              </div>
            )}
            <div className="text-xs text-slate-500 space-y-1">
              <p><strong>Required columns:</strong> Name, Rating (1-10), Preferred Size (M/L/XL/2XL/G2XL)</p>
              <p><strong>Optional columns:</strong> Goalie (Yes/No), IR (Yes/No), Woman (Yes/No), Friend Group (A/B/C...)</p>
            </div>
          </div>
        </div>

        {/* Team Name Editor */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Team Names</h2>
          <div className="grid grid-cols-2 gap-4">
            {['team1', 'team2'].map(team => (
              <div key={team} className="border rounded-lg p-4">
                {editingTeam === team ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tempTeamName}
                      onChange={(e) => setTempTeamName(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded"
                      placeholder="Team name"
                      autoFocus
                    />
                    <button
                      onClick={saveTeamName}
                      className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <Check size={20} />
                    </button>
                    <button
                      onClick={cancelEditTeamName}
                      className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-lg">{teamNames[team]}</span>
                    <button
                      onClick={() => startEditTeamName(team)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Jersey Inventory */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Shirt className="text-blue-600" />
            Jersey Inventory
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {['team1', 'team2'].map(team => (
              <div key={team} className="border rounded-lg p-4">
                <h3 className="font-bold mb-3">{teamNames[team]}</h3>
                <div className="space-y-2">
                  {sizes.map(size => (
                    <div key={size} className="flex items-center gap-2">
                      <label className="w-16 text-sm font-medium">{size}:</label>
                      <input
                        type="number"
                        min="0"
                        value={inventory[team][size]}
                        onChange={(e) => updateInventory(team, size, e.target.value)}
                        className="flex-1 px-3 py-1 border rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Player Management */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="text-green-600" />
              Players ({players.length})
            </h2>
            <button
              onClick={addPlayer}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              + Add Player
            </button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {players.map(player => {
              // Find which friend group this player belongs to
              const groupIndex = friendGroups.findIndex(group => group.includes(player.id));
              const groupColors = [
                'bg-blue-100 border-blue-300',
                'bg-green-100 border-green-300',
                'bg-purple-100 border-purple-300',
                'bg-pink-100 border-pink-300',
                'bg-yellow-100 border-yellow-300',
                'bg-indigo-100 border-indigo-300',
                'bg-red-100 border-red-300',
                'bg-orange-100 border-orange-300',
              ];
              const groupColor = groupIndex >= 0 ? groupColors[groupIndex % groupColors.length] : 'bg-white';
              const borderClass = groupIndex >= 0 ? 'border-2' : 'border';
              
              return (
              <div key={player.id} className={`flex gap-2 items-center p-2 rounded ${groupColor} ${borderClass}`}>
                <input
                  type="text"
                  placeholder="Name"
                  value={player.name}
                  onChange={(e) => updatePlayer(player.id, 'name', e.target.value)}
                  className="flex-1 px-2 py-1 border rounded"
                />
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={player.rating}
                  onChange={(e) => updatePlayer(player.id, 'rating', parseInt(e.target.value) || 5)}
                  className="w-16 px-2 py-1 border rounded"
                  title="Rating (1-10)"
                />
                <select
                  value={player.preferredSize}
                  onChange={(e) => updatePlayer(player.id, 'preferredSize', e.target.value)}
                  className="px-2 py-1 border rounded"
                >
                  {sizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={player.isGoalie}
                    onChange={(e) => updatePlayer(player.id, 'isGoalie', e.target.checked)}
                  />
                  G
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={player.isIR}
                    onChange={(e) => updatePlayer(player.id, 'isIR', e.target.checked)}
                  />
                  IR
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={player.isWoman}
                    onChange={(e) => updatePlayer(player.id, 'isWoman', e.target.checked)}
                  />
                  W
                </label>
                <button
                  onClick={() => removePlayer(player.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <X size={18} />
                </button>
              </div>
            );
            })}
          </div>
        </div>

        {/* Friend Groups */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Friend Groups</h2>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Create New Group</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {players.map(player => (
                  <button
                    key={player.id}
                    onClick={() => addToNewGroup(player.id)}
                    className={`px-3 py-1 rounded text-sm transition ${
                      newGroup.includes(player.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {player.name || `Player ${player.id}`}
                  </button>
                ))}
              </div>
              <button
                onClick={createFriendGroup}
                disabled={newGroup.length < 2}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-slate-300 transition"
              >
                Create Group ({newGroup.length} selected)
              </button>
            </div>
            {friendGroups.map((group, index) => (
              <div key={index} className="border rounded-lg p-4 bg-slate-50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">Group {index + 1}</h3>
                  <button
                    onClick={() => removeFriendGroup(index)}
                    className="text-red-600 hover:bg-red-50 p-1 rounded"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.map(playerId => {
                    const player = players.find(p => p.id === playerId);
                    return (
                      <span key={playerId} className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {player?.name || `Player ${playerId}`}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Balance Teams Button */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex gap-4">
            <button
              onClick={balanceTeams}
              className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold text-lg flex items-center justify-center gap-2"
            >
              <Shuffle size={24} />
              Balance Teams
            </button>
            <button
              onClick={clearTeams}
              className="px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-bold text-lg"
            >
              Clear Teams
            </button>
          </div>
        </div>

        {/* Team Stats */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Team Statistics</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-bold text-lg mb-3">{teamNames.team1}</h3>
              <div className="space-y-2 text-sm">
                <p>Players: <span className="font-bold">{stats.team1.count}</span></p>
                <p>Total Rating: <span className="font-bold">{stats.team1.rating}</span></p>
                <p>Avg Rating: <span className="font-bold">{stats.team1.count > 0 ? (stats.team1.rating / stats.team1.count).toFixed(1) : 0}</span></p>
                <p>Goalies: <span className="font-bold">{stats.team1.goalies}</span></p>
                <p>Women: <span className="font-bold">{stats.team1.women}</span></p>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-bold text-lg mb-3">{teamNames.team2}</h3>
              <div className="space-y-2 text-sm">
                <p>Players: <span className="font-bold">{stats.team2.count}</span></p>
                <p>Total Rating: <span className="font-bold">{stats.team2.rating}</span></p>
                <p>Avg Rating: <span className="font-bold">{stats.team2.count > 0 ? (stats.team2.rating / stats.team2.count).toFixed(1) : 0}</span></p>
                <p>Goalies: <span className="font-bold">{stats.team2.goalies}</span></p>
                <p>Women: <span className="font-bold">{stats.team2.women}</span></p>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-bold text-lg mb-3">Jerseys</h3>
              <div className="space-y-2 text-sm">
                <p className="text-green-600">✓ Preferred Size: <span className="font-bold">{stats.jerseys.preferredSizeMet}</span></p>
                <p className="text-yellow-600">↑ Sized Up: <span className="font-bold">{stats.jerseys.sizedUp}</span></p>
                <p className="text-red-600">✗ Unmet: <span className="font-bold">{stats.jerseys.unmetNeeds}</span></p>
              </div>
            </div>
          </div>
          {Math.abs(stats.team1.rating - stats.team2.rating) > stats.team1.count * 0.5 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded flex items-start gap-2">
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-yellow-800">
                Teams may be unbalanced. Rating difference: {Math.abs(stats.team1.rating - stats.team2.rating).toFixed(1)}
              </p>
            </div>
          )}
        </div>

        {/* Export Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Export Results</h2>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={downloadForExcel}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
            >
              <FileSpreadsheet size={20} />
              Excel
            </button>
            <button
              onClick={downloadAdminRoster}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
            >
              <FileText size={20} />
              Admin PDF
            </button>
            <button
              onClick={downloadPublicRoster}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
            >
              <Users size={20} />
              Public PDF
            </button>
          </div>
          <p className="text-sm text-slate-600 mt-3">
            Download formatted data and upload back to Claude to create Excel spreadsheets or PDFs
          </p>
        </div>

        {/* Team Rosters */}
        <div className="grid md:grid-cols-2 gap-6">
          {['team1', 'team2'].map(team => {
            const teamPlayers = players.filter(p => p.team === team);
            const avgRating = teamPlayers.length > 0 
              ? (teamPlayers.reduce((sum, p) => sum + p.rating, 0) / teamPlayers.length).toFixed(2)
              : '0.00';
            
            return (
            <div key={team} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">{teamNames[team]} Roster</h2>
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg">
                  <Star className="text-yellow-500" size={18} />
                  <span className="font-bold text-slate-700">{avgRating}</span>
                </div>
              </div>
              <div className="space-y-2">
                {teamPlayers.map(player => {
                  // Find which friend group this player belongs to
                  const groupIndex = friendGroups.findIndex(group => group.includes(player.id));
                  const groupColors = [
                    'bg-blue-100 border-blue-300',
                    'bg-green-100 border-green-300',
                    'bg-purple-100 border-purple-300',
                    'bg-pink-100 border-pink-300',
                    'bg-yellow-100 border-yellow-300',
                    'bg-indigo-100 border-indigo-300',
                    'bg-red-100 border-red-300',
                    'bg-orange-100 border-orange-300',
                  ];
                  const groupColor = groupIndex >= 0 ? groupColors[groupIndex % groupColors.length] : 'bg-slate-50';
                  const borderClass = groupIndex >= 0 ? 'border-2' : '';
                  
                  // Use saved assignedSize
                  const assignedSize = player.assignedSize || 'TBD';
                  const sizedUp = assignedSize !== 'TBD' && assignedSize !== player.preferredSize;
                  const noSize = assignedSize === 'TBD';
                  
                  return (
                  <div key={player.id} className={`p-3 rounded flex justify-between items-center ${groupColor} ${borderClass}`}>
                    <div>
                      <p className="font-medium">{player.name || `Player ${player.id}`}</p>
                      <p className="text-sm text-slate-600">
                        Rating: {player.rating} | 
                        Jersey: {player.preferredSize} → 
                        <span className={`font-medium ${noSize ? 'text-red-600' : sizedUp ? 'text-yellow-600' : 'text-green-600'}`}>
                          {assignedSize}
                        </span>
                        {player.isGoalie && ' | Goalie'}
                        {player.isIR && ' | IR'}
                      </p>
                    </div>
                  </div>
                );
                })}
                {teamPlayers.length === 0 && (
                  <p className="text-slate-400 text-center py-4">No players assigned</p>
                )}
              </div>
            </div>
          );
          })}
        </div>
      </div>
    </div>
  );
};

export default HockeyTeamBalancerWithUpload;
