-- Iris temporal perspective utilities
-- Usage: local temporal = require("iris.temporal")

local M = {}

-- Parse YYYY-MM-DD date to Unix timestamp (end of day)
function M.parse_date(date_str)
    if not date_str then return nil end

    local y, m, d = date_str:match("(%d+)-(%d+)-(%d+)")
    if not y then return nil end

    return os.time({
        year = tonumber(y),
        month = tonumber(m),
        day = tonumber(d),
        hour = 23,
        min = 59,
        sec = 59,
    })
end

-- Format Unix timestamp as readable date
function M.format_date(ts)
    if not ts then return nil end
    return os.date("%B %d, %Y", ts)  -- e.g., "January 19, 2026"
end

-- Format Unix timestamp as ISO date
function M.format_iso(ts)
    if not ts then return nil end
    return os.date("%Y-%m-%d", ts)
end

-- Get timestamp from session metadata
function M.session_timestamp(session)
    if not session then return nil end

    -- Try metadata timestamp
    if session.metadata then
        local ts = session.metadata.timestamp or session.metadata.start_time
        if ts then
            -- Try parsing ISO format
            local y, m, d = tostring(ts):match("(%d+)-(%d+)-(%d+)")
            if y then
                return os.time({
                    year = tonumber(y),
                    month = tonumber(m),
                    day = tonumber(d),
                    hour = 12,
                    min = 0,
                    sec = 0,
                })
            end
            -- Try Unix timestamp
            local unix = tonumber(ts)
            if unix and unix > 1000000000 then
                return unix
            end
        end
    end

    -- Try first turn timestamp
    if session.turns and session.turns[1] then
        local turn = session.turns[1]
        if turn.timestamp then
            local y, m, d = tostring(turn.timestamp):match("(%d+)-(%d+)-(%d+)")
            if y then
                return os.time({
                    year = tonumber(y),
                    month = tonumber(m),
                    day = tonumber(d),
                    hour = 12,
                    min = 0,
                    sec = 0,
                })
            end
        end
    end

    return nil
end

-- Filter sessions to only those before a cutoff date
function M.filter_before(sessions, cutoff_ts)
    if not cutoff_ts then return sessions end

    local filtered = {}
    for _, session in ipairs(sessions) do
        local ts = M.session_timestamp(session)
        if not ts or ts <= cutoff_ts then
            table.insert(filtered, session)
        end
    end
    return filtered
end

-- Generate temporal context for prompt injection
-- as_of: Unix timestamp for the "present" moment
function M.context_for_prompt(as_of)
    if not as_of then return nil end

    local date_str = M.format_date(as_of)
    local day_of_week = os.date("%A", as_of)

    return string.format([[
## Temporal Context

Today is %s, %s.

Write as if this is the present moment. Events described in the sessions happened recently relative to this date. Use past tense for things that have happened, present tense for ongoing work, and avoid references to dates after this point.
]], day_of_week, date_str)
end

-- Group sessions by week (for --batch-by-week)
-- Returns array of {week_start, week_end, sessions}
function M.group_by_week(sessions)
    local weeks = {}
    local week_map = {}  -- week_start -> sessions array

    for _, session in ipairs(sessions) do
        local ts = M.session_timestamp(session)
        if ts then
            -- Get start of week (Monday)
            local date = os.date("*t", ts)
            local day_offset = (date.wday - 2) % 7  -- Monday = 0
            local week_start = ts - (day_offset * 86400) - (date.hour * 3600) - (date.min * 60) - date.sec
            week_start = os.time({
                year = os.date("*t", week_start).year,
                month = os.date("*t", week_start).month,
                day = os.date("*t", week_start).day,
                hour = 0, min = 0, sec = 0,
            })

            if not week_map[week_start] then
                week_map[week_start] = {}
            end
            table.insert(week_map[week_start], session)
        else
            -- No timestamp, put in "unknown" bucket
            if not week_map[0] then
                week_map[0] = {}
            end
            table.insert(week_map[0], session)
        end
    end

    -- Convert to sorted array
    local sorted_weeks = {}
    for week_start, _ in pairs(week_map) do
        table.insert(sorted_weeks, week_start)
    end
    table.sort(sorted_weeks)

    for _, week_start in ipairs(sorted_weeks) do
        local week_end = week_start + (7 * 86400) - 1
        table.insert(weeks, {
            week_start = week_start,
            week_end = week_end,
            week_label = week_start > 0 and M.format_iso(week_start) or "unknown",
            sessions = week_map[week_start],
        })
    end

    return weeks
end

return M
