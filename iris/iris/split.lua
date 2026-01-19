-- Iris session splitting for multi-day sessions
-- Usage: local split = require("iris.split")

local M = {}

-- Default time gap threshold (in seconds) - 4 hours
M.DEFAULT_GAP_THRESHOLD = 4 * 60 * 60

-- Parse ISO timestamp to Unix time
local function parse_timestamp(ts)
    if not ts then return nil end

    -- Try ISO 8601 format: 2026-01-19T10:30:00Z
    local y, m, d, h, min, s = ts:match("(%d+)-(%d+)-(%d+)T(%d+):(%d+):(%d+)")
    if y then
        return os.time({
            year = tonumber(y),
            month = tonumber(m),
            day = tonumber(d),
            hour = tonumber(h),
            min = tonumber(min),
            sec = tonumber(s)
        })
    end

    -- Try Unix timestamp
    local unix = tonumber(ts)
    if unix and unix > 1000000000 then
        return unix
    end

    return nil
end

-- Get timestamp from a turn
local function get_turn_timestamp(turn)
    -- Try turn-level timestamp
    if turn.timestamp then
        return parse_timestamp(turn.timestamp)
    end

    -- Try first message timestamp
    if turn.messages and turn.messages[1] then
        local msg = turn.messages[1]
        if msg.timestamp then
            return parse_timestamp(msg.timestamp)
        end
    end

    return nil
end

-- Find split points in a session based on time gaps
-- Returns array of indices where splits should occur
function M.find_split_points(session, opts)
    opts = opts or {}
    local gap_threshold = opts.gap_threshold or M.DEFAULT_GAP_THRESHOLD

    local turns = session.turns or {}
    if #turns < 2 then
        return {}  -- Nothing to split
    end

    local split_points = {}
    local prev_time = nil

    for i, turn in ipairs(turns) do
        local curr_time = get_turn_timestamp(turn)

        if curr_time and prev_time then
            local gap = curr_time - prev_time
            if gap > gap_threshold then
                table.insert(split_points, {
                    index = i,
                    gap_seconds = gap,
                    gap_hours = gap / 3600,
                    before_time = prev_time,
                    after_time = curr_time,
                })
            end
        end

        if curr_time then
            prev_time = curr_time
        end
    end

    return split_points
end

-- Split a session into multiple logical segments
-- Returns array of session-like objects
function M.split_session(session, opts)
    opts = opts or {}

    local split_points = M.find_split_points(session, opts)

    if #split_points == 0 then
        -- No splits needed, return session as-is in an array
        return { session }
    end

    local segments = {}
    local turns = session.turns or {}
    local start_idx = 1

    for i, sp in ipairs(split_points) do
        -- Create segment from start_idx to sp.index - 1
        local segment_turns = {}
        for j = start_idx, sp.index - 1 do
            table.insert(segment_turns, turns[j])
        end

        if #segment_turns > 0 then
            table.insert(segments, {
                turns = segment_turns,
                format = session.format,
                metadata = session.metadata,
                segment_index = i,
                segment_start_time = get_turn_timestamp(segment_turns[1]),
                segment_end_time = get_turn_timestamp(segment_turns[#segment_turns]),
                gap_after_hours = sp.gap_hours,
            })
        end

        start_idx = sp.index
    end

    -- Add final segment
    local final_turns = {}
    for j = start_idx, #turns do
        table.insert(final_turns, turns[j])
    end

    if #final_turns > 0 then
        table.insert(segments, {
            turns = final_turns,
            format = session.format,
            metadata = session.metadata,
            segment_index = #split_points + 1,
            segment_start_time = get_turn_timestamp(final_turns[1]),
            segment_end_time = get_turn_timestamp(final_turns[#final_turns]),
            gap_after_hours = nil,  -- No gap after last segment
        })
    end

    return segments
end

-- Analyze a session for potential splits (without actually splitting)
function M.analyze(session, opts)
    local split_points = M.find_split_points(session, opts)

    local result = {
        total_turns = #(session.turns or {}),
        split_count = #split_points,
        splits = {},
    }

    for _, sp in ipairs(split_points) do
        table.insert(result.splits, {
            at_turn = sp.index,
            gap_hours = math.floor(sp.gap_hours * 10) / 10,  -- Round to 1 decimal
            before = sp.before_time and os.date("%Y-%m-%d %H:%M", sp.before_time),
            after = sp.after_time and os.date("%Y-%m-%d %H:%M", sp.after_time),
        })
    end

    return result
end

-- Format split info for display
function M.format_analysis(analysis)
    local lines = {}
    table.insert(lines, string.format("Session: %d turns", analysis.total_turns))

    if analysis.split_count == 0 then
        table.insert(lines, "No significant time gaps found.")
    else
        table.insert(lines, string.format("Found %d split points:", analysis.split_count))
        for _, sp in ipairs(analysis.splits) do
            table.insert(lines, string.format(
                "  Turn %d: %.1f hour gap (%s → %s)",
                sp.at_turn, sp.gap_hours,
                sp.before or "?", sp.after or "?"
            ))
        end
    end

    return table.concat(lines, "\n")
end

return M
