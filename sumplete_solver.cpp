#include <iostream>
#include <vector>
#include <unordered_set>

using namespace std;

int MOD = 30000000;

void print_matrix(const vector<vector<int>>& matrix) {
  int N = matrix.size();

  vector<int> col_sums(N);
  for (int i = 0; i < N; i++) {
    int row_sum = 0;
    for (int j = 0; j < N; j++) {
      row_sum += matrix[i][j];
      col_sums[j] += matrix[i][j];
      cout << matrix[i][j] << "\t";
    }
    cout << " | " << row_sum << endl;
  }
  cout << "----------------------------------------------------" << endl;
  for (int j = 0; j < N; j++) {
    cout << col_sums[j] << "\t";
  }
  cout << endl;
}

bool is_valid_until_now(
  const int N,
  const vector<vector<int>>& running_matrix,
  const vector<int>& row_sum,
  const vector<int>& col_sum,
  const int row,
  const int col
) {
  // Current row sum is less than target row sum
  int current_row_sum = 0;
  for (int j = 0; j <= col; j++) {
    current_row_sum += running_matrix[row][j];
  }
  if (col == N-1 && current_row_sum != row_sum[row]) {
    return false;
  }
  if (col < N-1 && current_row_sum > row_sum[row]) {
    return false;
  }

  // If we're at the last row
  // Current column sum is less than target column sum for columns seen till now
  if (row == N-1) {
    vector<int> running_col_sum(col+1, 0);
    for (int i = 0; i < N; i++) {
      for (int j = 0; j <= col; j++) {
        running_col_sum[j] += running_matrix[i][j];
      }
    }
    for (int j = 0; j <= col; j++) {
      if (running_col_sum[j] != col_sum[j]) {
        return false;
      }
    }
  }

  return true;
}

bool is_valid_solution(
  const int N,
  const vector<vector<int>>& running_matrix,
  const vector<int>& row_sum,
  const vector<int>& col_sum
) {
  vector<int> running_col_sum(N);

  for (int i = 0; i < N; i++) {
    int running_row_sum = 0;
    for (int j = 0; j < N; j++) {
      running_row_sum += running_matrix[i][j];
      running_col_sum[j] += running_matrix[i][j];
    }
    if (running_row_sum != row_sum[i]) {
      return false;
    }
  }

  for (int i = 0; i < N; i++) {
    if (running_col_sum[i] != col_sum[i]) {
      return false;
    }
  }
  
  return true;
}

bool backtrack(
  const int N,
  const int row,
  const int col,
  vector<vector<int>>& running_matrix,
  const vector<int>& row_sum,
  const vector<int>& col_sum,
  int& iteration_counter
) {
  iteration_counter++;
  if (iteration_counter > MOD) {
    return false;
  }

  if (row == N) {
    return is_valid_solution(N, running_matrix, row_sum, col_sum);
  };

  int new_row = (col == N-1 ? row+1 : row);
  int new_col = (col == N-1 ? 0 : col+1);

  if (is_valid_until_now(N, running_matrix, row_sum, col_sum, row, col)) {
    bool is_solved_without_change = backtrack(
      N,
      new_row,
      new_col,
      running_matrix,
      row_sum,
      col_sum,
      iteration_counter
    );

    if (is_solved_without_change) {
      return true;
    }
  }

  int current_value = running_matrix[row][col];
  running_matrix[row][col] = 0;

  if (is_valid_until_now(N, running_matrix, row_sum, col_sum, row, col)) {
    bool is_solved_by_setting_zero = backtrack(
      N,
      new_row,
      new_col,
      running_matrix,
      row_sum,
      col_sum,
      iteration_counter
    );
    if (is_solved_by_setting_zero) {
      return true;
    }
  }

  // Resetting running_matrix to what it was at the start of this row, col pair.
  running_matrix[row][col] = current_value;
  return false;
}


pair<bool, vector<vector<int>>> solve_sumplete(
  const int N,
  const vector<vector<int>> matrix,
  const vector<int>& row_sum,
  const vector<int>& col_sum
) {
  vector<vector<int>> running_matrix = matrix;
  int iteration_counter = 1;

  bool is_solved = backtrack(
    N,
    0,
    0,
    running_matrix,
    row_sum,
    col_sum,
    iteration_counter
  );

  if (is_solved) {
    return {true, running_matrix};
  }
  return {false, {}};
}

int main() {
  int N;
  cin >> N;

  vector<vector<int>> matrix(N, vector<int>(N));
  vector<int> row_sum(N), col_sum(N);

  for (int i = 0; i <= N; i++) {
    for (int j = 0; j <= N; j++) {
      if (i == N && j == N) {
        continue;
      } else if (i == N) {
        cin>>col_sum[j];
      } else if (j == N) {
        cin>>row_sum[i];
      } else {
        cin>>matrix[i][j];
      }
    }
  }

  pair<bool, vector<vector<int>>> solved_sumplete = solve_sumplete(N, matrix, row_sum, col_sum);
  if (!solved_sumplete.first) {
    cout << "-1";
    return 0;
  }
  // print_matrix(solved_sumplete.second);
  for (int i = 0; i < N; i++) {
    for (int j = 0; j < N; j++) {
      cout << solved_sumplete.second[i][j] << " ";
    }
    cout << endl;
  }
}

/**
5
8 7 8 7 2 17
5 7 9 7 9 7
5 7 5 2 1 13
9 4 1 6 3 18
2 1 3 8 5 11
11 22 13 14 6


7
9 4 4 8 7 5 3 33
2 2 8 4 7 7 5 28
3 4 7 3 4 1 1 8
6 6 4 8 3 8 1 20
4 2 2 5 9 7 3 21
9 7 5 9 8 5 4 33
1 6 5 6 9 6 3 21
27 19 21 21 43 24 9
*/
