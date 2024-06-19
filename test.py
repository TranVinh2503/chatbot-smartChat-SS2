def min_cut_rectangles(A):
    M = len(A)
    N = len(A[0])

    dp = [[0] * N for _ in range(M)]
    
    # Initialize the first row and first column
    dp[0][0] = 1 if A[0][0] == 1 else 0
    for i in range(1, M):
        dp[i][0] = 1 if A[i][0] == 1 and dp[i-1][0] == 1 else 0
    for j in range(1, N):
        dp[0][j] = 1 if A[0][j] == 1 and dp[0][j-1] == 1 else 0
    
    for i in range(1, M):
        for j in range(1, N):
            if A[i][j] == 1:
                dp[i][j] = min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + 1
            else:
                dp[i][j] = 0
                
    return max(max(row) for row in dp) ** 2

# Example input
A = [
    [1, 1, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 1, 0]
]

result = min_cut_rectangles(A)
print(result)  # Output: 4
